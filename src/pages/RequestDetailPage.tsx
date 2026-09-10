import { useEffect, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { Alert, App, Button, Card, Descriptions, Input, Popconfirm, Skeleton, Steps } from 'antd'
import { ArrowLeftOutlined, CheckOutlined, CloseOutlined } from '@ant-design/icons'
import PageHeading from '../components/common/PageHeading'
import { decideRequest, getRequest } from '../services/api/requestService'
import { useCurrentUser } from '../context/CurrentUserContext'
import { getErrorMessage } from '../utils/errors'
import StatusBadge from '../components/common/StatusBadge'
import { color } from '../theme/tokens'
import { formatRupiah, parseServerDate } from '../utils/format'
import type { ApprovalRequest, ApprovalStep, Decision } from '../types/domain'

const STEP_STATUS: Record<string, 'wait' | 'process' | 'finish' | 'error'> = {
  waiting: 'wait',
  active: 'process',
  approved: 'finish',
  rejected: 'error',
  skipped: 'finish',
  resolution_failed: 'error',
}

function formatValue(key: string, value: unknown): string {
  if (typeof value === 'number') return key.toLowerCase().includes('amount') ? formatRupiah(value) : value.toLocaleString('id-ID')
  if (typeof value === 'boolean') return value ? 'Ya' : 'Tidak'
  if (value === null || value === undefined) return '—'
  if (typeof value === 'object') return JSON.stringify(value, null, 2)
  return String(value)
}

function stepDescription(step: ApprovalStep) {
  if (step.status === 'skipped') {
    return <span style={{ color: color.textTertiary }}>Dilewati — syarat tidak terpenuhi</span>
  }
  if (!step.assignments || step.assignments.length === 0) {
    return step.status === 'resolution_failed' ? (
      <span style={{ color: color.danger }}>Tidak ada approver ditemukan — perlu ditinjau manual</span>
    ) : null
  }
  return (
    <div className="space-y-0.5">
      {step.assignments.map((a) => (
        <p key={a.id} className="text-xs" style={{ color: color.textSecondary }}>
          <span className="font-medium" style={{ color: color.textPrimary }}>
            {a.user_name ?? a.user_id}
          </span>
          {a.user_position ? ` · ${a.user_position}` : ''} — {{ pending: 'Menunggu', approved: 'Disetujui', rejected: 'Ditolak', skipped: 'Dilewati' }[a.status]}
          {a.comment ? `: "${a.comment}"` : ''}
        </p>
      ))}
    </div>
  )
}

export default function RequestDetailPage() {
  const { id } = useParams<{ id: string }>()
  const { userId } = useCurrentUser()
  const { message } = App.useApp()
  const [request, setRequest] = useState<ApprovalRequest | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [comment, setComment] = useState('')
  const [submitting, setSubmitting] = useState(false)

  function load() {
    if (!id) return
    getRequest(id)
      .then((data) => { setRequest(data); setError(null) })
      .catch((err) => setError(getErrorMessage(err)))
  }

  useEffect(load, [id])

  async function handleDecision(decision: Decision) {
    if (!id || !userId) return
    setSubmitting(true)
    try {
      const updated = await decideRequest(id, { user_id: userId, decision, comment: comment.trim() || undefined })
      setRequest(updated)
      setComment('')
      message.success(decision === 'approved' ? 'Permintaan disetujui' : 'Permintaan ditolak')
    } catch (err) {
      message.error(getErrorMessage(err))
    } finally {
      setSubmitting(false)
    }
  }

  if (error && !request) return <Alert type="error" showIcon message="Detail permintaan belum dapat dimuat" description={error} action={<Button onClick={() => { setError(null); load() }}>Coba lagi</Button>} />
  if (!request) {
    return (
      <Card variant="borderless" style={{ border: `1px solid ${color.border}` }}>
        <Skeleton active paragraph={{ rows: 5 }} />
      </Card>
    )
  }

  const activeStep = request.steps?.find((s) => s.status === 'active')
  const myAssignment = activeStep?.assignments?.find((a) => a.user_id === userId && a.status === 'pending')
  const payloadEntries = Object.entries(request.payload ?? {})

  return (
    <div>
      <Link to="/inbox" className="mb-5 inline-flex items-center gap-2 text-sm"><ArrowLeftOutlined />Kembali ke kotak masuk</Link>
      <PageHeading title={request.resource_id} description={`${request.doc_type.replaceAll('_', ' ')} · Detail permintaan dan riwayat persetujuan`} action={<StatusBadge status={request.status} />} />
      <div className="detail-grid">
      <div className="space-y-5">
      <Card variant="borderless" style={{ border: `1px solid ${color.border}` }} title="Informasi permintaan">

        <Descriptions
          column={{ xs: 1, sm: 2 }}
          size="small"
          items={[
            { key: 'requester', label: 'Pemohon', children: <span className="font-data">{request.requester_id}</span> },
            { key: 'created', label: 'Dibuat', children: parseServerDate(request.created_at).toLocaleString('id-ID') },
          ]}
        />

        {payloadEntries.length > 0 && (
          <>
            <h2 className="mb-3 mt-5 text-sm font-semibold">
              Data permintaan
            </h2>
            <Descriptions
              bordered
              size="small"
              column={1}
              items={payloadEntries.map(([k, v]) => ({ key: k, label: k.replaceAll('_', ' '), children: <span style={{ whiteSpace: 'pre-wrap', overflowWrap: 'anywhere' }}>{formatValue(k, v)}</span> }))}
            />
          </>
        )}
      </Card>

      <Card variant="borderless" style={{ border: `1px solid ${color.border}` }} title="Alur approval">
        <Steps
          direction="vertical"
          size="small"
          current={request.steps?.findIndex((s) => s.status === 'active') ?? -1}
          items={request.steps?.map((step) => ({
            title: step.name,
            status: STEP_STATUS[step.status] ?? 'wait',
            description: stepDescription(step),
          }))}
        />
      </Card>
      </div>

      <aside>
      {myAssignment ? (
        <Card variant="borderless" style={{ border: `1px solid ${color.border}` }} title="Keputusan Anda">
          <p className="mb-5 text-sm text-[var(--ae-text-secondary)]">Periksa informasi permintaan dan riwayat persetujuan sebelum memberikan keputusan.</p>
          <label htmlFor="decision-comment" className="mb-2 block text-sm font-semibold">Komentar <span className="font-normal text-[var(--ae-text-secondary)]">(opsional)</span></label>
          <Input.TextArea
            id="decision-comment"
            value={comment}
            onChange={(e) => setComment(e.target.value)}
            placeholder="Komentar (opsional)"
            rows={4}
          />
          <div className="decision-actions mt-5">
            <Button type="primary" icon={<CheckOutlined aria-hidden="true" />} loading={submitting} onClick={() => handleDecision('approved')}>
              Setujui
            </Button>
            <Popconfirm
              title="Tolak permintaan ini?"
              description="Alur approval akan berhenti dan tidak bisa dilanjutkan lagi."
              okText="Ya, tolak"
              cancelText="Batal"
              okButtonProps={{ danger: true }}
              onConfirm={() => handleDecision('rejected')}
            >
              <Button danger icon={<CloseOutlined />} loading={submitting}>
                Tolak
              </Button>
            </Popconfirm>
          </div>
          <p className="mt-4 text-xs leading-relaxed text-[var(--ae-text-secondary)]">Persetujuan meneruskan proses sesuai alur. Penolakan menghentikan permintaan.</p>
        </Card>
      ) : (
        <Alert type={request.status === 'approved' ? 'success' : 'info'} showIcon message="Tidak ada tindakan untuk Anda" description={request.status === 'pending' ? 'Permintaan sedang menunggu keputusan dari penerima persetujuan lainnya.' : 'Permintaan ini telah selesai diproses. Anda dapat kembali ke kotak masuk untuk meninjau permintaan lain.'} />
      )}
      </aside>
      </div>
    </div>
  )
}
