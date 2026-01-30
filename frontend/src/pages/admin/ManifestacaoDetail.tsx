import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { ArrowLeftIcon } from '@heroicons/react/24/outline';
import { Button, Select, Textarea } from '../../components/ui';
import { manifestacaoService } from '../../services';
import { useToast } from '../../contexts';
import type { Manifestacao, StatusManifestacao } from '../../types';
import { STATUS_LABELS, TIPOS_MANIFESTACAO_LABELS } from '../../types';

function formatDate(dateString: string): string {
  return new Date(dateString).toLocaleDateString('pt-BR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}

const statusColors: Record<string, string> = {
  RECEBIDA: 'bg-blue-100 text-blue-800',
  EM_ANALISE: 'bg-yellow-100 text-yellow-800',
  RESPONDIDA: 'bg-green-100 text-green-800',
  ARQUIVADA: 'bg-gray-100 text-gray-800',
};

export default function ManifestacaoDetail() {
  const { id } = useParams<{ id: string }>();
  const toast = useToast();

  const [manifestacao, setManifestacao] = useState<Manifestacao | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [newStatus, setNewStatus] = useState('');
  const [resposta, setResposta] = useState('');
  const [isUpdating, setIsUpdating] = useState(false);
  const [isSendingResposta, setIsSendingResposta] = useState(false);

  const statusOptions = Object.entries(STATUS_LABELS).map(([value, label]) => ({
    value,
    label,
  }));

  useEffect(() => {
    const fetchManifestacao = async () => {
      if (!id) return;

      try {
        const data = await manifestacaoService.getById(id);
        setManifestacao(data);
        setNewStatus(data.status);
      } catch {
        toast.error('Erro', 'Não foi possível carregar a manifestação.');
      } finally {
        setIsLoading(false);
      }
    };

    fetchManifestacao();
  }, [id, toast]);

  const handleUpdateStatus = async () => {
    if (!id || !newStatus || newStatus === manifestacao?.status) return;

    setIsUpdating(true);
    try {
      const updated = await manifestacaoService.updateStatus(id, newStatus);
      setManifestacao(updated);
      toast.success('Status atualizado', 'O status foi alterado com sucesso.');
    } catch {
      toast.error('Erro', 'Não foi possível atualizar o status.');
    } finally {
      setIsUpdating(false);
    }
  };

  const handleSendResposta = async () => {
    if (!id || !resposta.trim()) {
      toast.warning('Campo obrigatório', 'Digite a resposta antes de enviar.');
      return;
    }

    setIsSendingResposta(true);
    try {
      const updated = await manifestacaoService.addResposta(id, resposta);
      setManifestacao(updated);
      setResposta('');
      toast.success('Resposta enviada', 'A resposta foi registrada com sucesso.');
    } catch {
      toast.error('Erro', 'Não foi possível enviar a resposta.');
    } finally {
      setIsSendingResposta(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-500" />
      </div>
    );
  }

  if (!manifestacao) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-600">Manifestação não encontrada.</p>
        <Link to="/admin/manifestacoes" className="text-primary-500 hover:underline mt-4 block">
          Voltar para lista
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center space-x-4">
        <Link
          to="/admin/manifestacoes"
          className="text-gray-500 hover:text-gray-700 transition-colors"
        >
          <ArrowLeftIcon className="h-5 w-5" aria-hidden="true" />
          <span className="sr-only">Voltar</span>
        </Link>
        <div>
          <h1 className="text-2xl font-bold text-gray-900">
            Manifestação {manifestacao.protocolo}
          </h1>
          <p className="text-gray-600">Detalhes e gestão da manifestação</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Informações</h2>

            <dl className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <dt className="text-sm text-gray-500">Protocolo</dt>
                <dd className="font-mono font-medium text-gray-900">{manifestacao.protocolo}</dd>
              </div>
              <div>
                <dt className="text-sm text-gray-500">Status</dt>
                <dd>
                  <span
                    className={`inline-flex px-2 py-1 rounded-full text-xs font-medium ${statusColors[manifestacao.status]}`}
                  >
                    {STATUS_LABELS[manifestacao.status as StatusManifestacao]}
                  </span>
                </dd>
              </div>
              <div>
                <dt className="text-sm text-gray-500">Tipo</dt>
                <dd className="font-medium text-gray-900">
                  {TIPOS_MANIFESTACAO_LABELS[manifestacao.tipo]}
                </dd>
              </div>
              <div>
                <dt className="text-sm text-gray-500">Órgão</dt>
                <dd className="font-medium text-gray-900">{manifestacao.orgao}</dd>
              </div>
              <div>
                <dt className="text-sm text-gray-500">Data de Registro</dt>
                <dd className="font-medium text-gray-900">{formatDate(manifestacao.createdAt)}</dd>
              </div>
              <div>
                <dt className="text-sm text-gray-500">Anônimo</dt>
                <dd className="font-medium text-gray-900">{manifestacao.anonimo ? 'Sim' : 'Não'}</dd>
              </div>
            </dl>

            {!manifestacao.anonimo && (
              <div className="mt-6 pt-6 border-t border-gray-200">
                <h3 className="text-sm font-medium text-gray-900 mb-3">Dados do Manifestante</h3>
                <dl className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <dt className="text-sm text-gray-500">Nome</dt>
                    <dd className="font-medium text-gray-900">{manifestacao.nome || '-'}</dd>
                  </div>
                  <div>
                    <dt className="text-sm text-gray-500">E-mail</dt>
                    <dd className="font-medium text-gray-900">{manifestacao.email || '-'}</dd>
                  </div>
                  <div>
                    <dt className="text-sm text-gray-500">Telefone</dt>
                    <dd className="font-medium text-gray-900">{manifestacao.telefone || '-'}</dd>
                  </div>
                </dl>
              </div>
            )}
          </div>

          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Conteúdo</h2>

            <div className="mb-4">
              <p className="text-sm text-gray-500 mb-1">Assunto</p>
              <p className="text-gray-900 font-medium">{manifestacao.assunto}</p>
            </div>

            {manifestacao.relato && (
              <div className="mb-4">
                <p className="text-sm text-gray-500 mb-1">Relato</p>
                <p className="text-gray-900 whitespace-pre-wrap bg-gray-50 p-4 rounded-lg">
                  {manifestacao.relato}
                </p>
              </div>
            )}

            {manifestacao.dataFato && (
              <div className="mb-4">
                <p className="text-sm text-gray-500 mb-1">Data do Fato</p>
                <p className="text-gray-900">{new Date(manifestacao.dataFato).toLocaleDateString('pt-BR')}</p>
              </div>
            )}

            {manifestacao.horarioFato && (
              <div className="mb-4">
                <p className="text-sm text-gray-500 mb-1">Horário do Fato</p>
                <p className="text-gray-900">{manifestacao.horarioFato}</p>
              </div>
            )}

            {manifestacao.local && (
              <div className="mb-4">
                <p className="text-sm text-gray-500 mb-1">Local</p>
                <p className="text-gray-900">{manifestacao.local}</p>
              </div>
            )}

            {manifestacao.pessoasEnvolvidas && (
              <div className="mb-4">
                <p className="text-sm text-gray-500 mb-1">Pessoas Envolvidas</p>
                <p className="text-gray-900">{manifestacao.pessoasEnvolvidas}</p>
              </div>
            )}

            {manifestacao.audioUrl && (
              <div className="mb-4">
                <p className="text-sm text-gray-500 mb-1">Áudio</p>
                <audio controls src={manifestacao.audioUrl} className="w-full">
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
                        <img src={anexo.url} alt="Anexo" className="w-full h-24 object-cover" />
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
          </div>

          {manifestacao.respostas.length > 0 && (
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">Respostas Anteriores</h2>
              <div className="space-y-4">
                {manifestacao.respostas.map((resp) => (
                  <div key={resp.id} className="bg-green-50 border border-green-200 rounded-lg p-4">
                    <div className="flex justify-between items-start mb-2">
                      <p className="text-sm font-medium text-green-800">
                        {resp.gestorNome || 'Gestor'}
                      </p>
                      <p className="text-xs text-green-600">{formatDate(resp.createdAt)}</p>
                    </div>
                    <p className="text-gray-900 whitespace-pre-wrap">{resp.texto}</p>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        <div className="space-y-6">
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Atualizar Status</h2>
            <div className="space-y-4">
              <Select
                label="Novo Status"
                options={statusOptions}
                value={newStatus}
                onChange={(e) => setNewStatus(e.target.value)}
              />
              <Button
                className="w-full"
                onClick={handleUpdateStatus}
                isLoading={isUpdating}
                disabled={newStatus === manifestacao.status}
              >
                Atualizar
              </Button>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Enviar Resposta</h2>
            <div className="space-y-4">
              <Textarea
                label="Resposta"
                value={resposta}
                onChange={(e) => setResposta(e.target.value)}
                placeholder="Digite a resposta para o cidadão..."
                rows={5}
              />
              <Button
                className="w-full"
                onClick={handleSendResposta}
                isLoading={isSendingResposta}
              >
                Enviar Resposta
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
