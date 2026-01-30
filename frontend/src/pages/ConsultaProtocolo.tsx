import { useState } from 'react';
import { MagnifyingGlassIcon } from '@heroicons/react/24/outline';
import { Button, Input } from '../components/ui';
import { manifestacaoService } from '../services';
import { useToast } from '../contexts';
import type { Manifestacao } from '../types';
import { STATUS_LABELS, TIPOS_MANIFESTACAO_LABELS } from '../types';

function formatDate(dateString: string): string {
  return new Date(dateString).toLocaleDateString('pt-BR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}

export default function ConsultaProtocolo() {
  const toast = useToast();
  const [protocolo, setProtocolo] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [manifestacao, setManifestacao] = useState<Manifestacao | null>(null);
  const [notFound, setNotFound] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!protocolo.trim()) {
      toast.warning('Campo obrigatório', 'Informe o número do protocolo.');
      return;
    }

    setIsLoading(true);
    setManifestacao(null);
    setNotFound(false);

    try {
      const result = await manifestacaoService.getByProtocolo(protocolo.trim());
      setManifestacao(result);
    } catch (error) {
      setNotFound(true);
      toast.error('Não encontrado', 'Nenhuma manifestação encontrada com este protocolo.');
    } finally {
      setIsLoading(false);
    }
  };

  const statusColors: Record<string, string> = {
    RECEBIDA: 'bg-blue-100 text-blue-800',
    EM_ANALISE: 'bg-yellow-100 text-yellow-800',
    RESPONDIDA: 'bg-green-100 text-green-800',
    ARQUIVADA: 'bg-gray-100 text-gray-800',
  };

  return (
    <div className="max-w-3xl mx-auto">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">
          Consultar Manifestação
        </h1>
        <p className="text-gray-600">
          Informe o número do protocolo para consultar o status da sua manifestação.
        </p>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 md:p-8 mb-8">
        <form onSubmit={handleSubmit} className="flex flex-col sm:flex-row gap-4">
          <div className="flex-1">
            <Input
              label="Número do Protocolo"
              value={protocolo}
              onChange={(e) => setProtocolo(e.target.value)}
              placeholder="Ex: 2024-001234"
              disabled={isLoading}
            />
          </div>
          <div className="flex items-end">
            <Button
              type="submit"
              isLoading={isLoading}
              leftIcon={<MagnifyingGlassIcon className="h-4 w-4" aria-hidden="true" />}
            >
              Consultar
            </Button>
          </div>
        </form>
      </div>

      {notFound && (
        <div
          className="bg-red-50 border border-red-200 rounded-xl p-6 text-center"
          role="alert"
        >
          <p className="text-red-800 font-medium">Manifestação não encontrada</p>
          <p className="text-red-600 text-sm mt-1">
            Verifique se o número do protocolo está correto e tente novamente.
          </p>
        </div>
      )}

      {manifestacao && (
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
          <div className="bg-primary-50 px-6 py-4 border-b border-primary-100">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
              <div>
                <p className="text-sm text-gray-600">Protocolo</p>
                <p className="text-xl font-bold text-gray-900">{manifestacao.protocolo}</p>
              </div>
              <span
                className={`inline-flex px-3 py-1 rounded-full text-sm font-medium ${statusColors[manifestacao.status]}`}
              >
                {STATUS_LABELS[manifestacao.status]}
              </span>
            </div>
          </div>

          <div className="p-6 space-y-6">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <p className="text-sm text-gray-500">Tipo</p>
                <p className="font-medium text-gray-900">
                  {TIPOS_MANIFESTACAO_LABELS[manifestacao.tipo]}
                </p>
              </div>
              <div>
                <p className="text-sm text-gray-500">Órgão</p>
                <p className="font-medium text-gray-900">{manifestacao.orgao}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500">Data de Registro</p>
                <p className="font-medium text-gray-900">{formatDate(manifestacao.createdAt)}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500">Última Atualização</p>
                <p className="font-medium text-gray-900">{formatDate(manifestacao.updatedAt)}</p>
              </div>
            </div>

            <div>
              <p className="text-sm text-gray-500 mb-1">Assunto</p>
              <p className="font-medium text-gray-900">{manifestacao.assunto}</p>
            </div>

            {manifestacao.relato && (
              <div>
                <p className="text-sm text-gray-500 mb-1">Relato</p>
                <p className="text-gray-900 whitespace-pre-wrap bg-gray-50 p-4 rounded-lg">
                  {manifestacao.relato}
                </p>
              </div>
            )}

            {manifestacao.audioUrl && (
              <div>
                <p className="text-sm text-gray-500 mb-1">Áudio</p>
                <audio
                  controls
                  src={manifestacao.audioUrl}
                  className="w-full"
                  aria-label="Áudio da manifestação"
                >
                  Seu navegador não suporta reprodução de áudio.
                </audio>
              </div>
            )}

            {manifestacao.anexos.length > 0 && (
              <div>
                <p className="text-sm text-gray-500 mb-2">Anexos</p>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                  {manifestacao.anexos.map((anexo) => (
                    <a
                      key={anexo.id}
                      href={anexo.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="block rounded-lg overflow-hidden border border-gray-200 hover:border-primary-500 transition-colors"
                    >
                      {anexo.tipo === 'IMAGEM' ? (
                        <img
                          src={anexo.url}
                          alt="Anexo"
                          className="w-full h-24 object-cover"
                        />
                      ) : (
                        <div className="w-full h-24 bg-gray-100 flex items-center justify-center text-gray-400">
                          {anexo.tipo === 'VIDEO' ? 'Vídeo' : 'Áudio'}
                        </div>
                      )}
                    </a>
                  ))}
                </div>
              </div>
            )}

            {manifestacao.respostas.length > 0 && (
              <div>
                <p className="text-sm text-gray-500 mb-2">Respostas</p>
                <div className="space-y-4">
                  {manifestacao.respostas.map((resposta) => (
                    <div
                      key={resposta.id}
                      className="bg-green-50 border border-green-200 rounded-lg p-4"
                    >
                      <div className="flex justify-between items-start mb-2">
                        <p className="text-sm font-medium text-green-800">
                          {resposta.gestorNome || 'Gestor'}
                        </p>
                        <p className="text-xs text-green-600">
                          {formatDate(resposta.createdAt)}
                        </p>
                      </div>
                      <p className="text-gray-900 whitespace-pre-wrap">{resposta.texto}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
