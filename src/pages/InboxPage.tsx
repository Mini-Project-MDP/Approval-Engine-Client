import { useDeferredValue, useEffect, useMemo, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { Alert, Button, Empty, Grid, Input, Select, Skeleton, Table } from 'antd'
import type { ColumnsType } from 'antd/es/table'
import { ReloadOutlined, SearchOutlined } from '@ant-design/icons'
import { getInbox } from '../services/api/inboxService'
import { useCurrentUser } from '../context/CurrentUserContext'
import { getErrorMessage } from '../utils/errors'
import { formatRupiah, parseServerDate, payloadAmount, relativeTime } from '../utils/format'
import PageHeading from '../components/common/PageHeading'
import StepProgress from '../components/common/StepProgress'
import type { InboxItem } from '../types/domain'

const HOW_IT_WORKS_KEY = 'approval-engine.how-it-works-dismissed'
function HowItWorks() {
  const [open, setOpen] = useState(() => {
    try { return localStorage.getItem(HOW_IT_WORKS_KEY) !== '1' } catch { return true }
  })
  return (
    <details className="inbox-guide" open={open} onToggle={(event) => {
      const next = event.currentTarget.open
      setOpen(next)
      try { localStorage.setItem(HOW_IT_WORKS_KEY, next ? '0' : '1') } catch { /* Optional preference. */ }
    }}>
      <summary>Panduan memproses permintaan</summary>
      <ol>
        <li><strong>Buka permintaan</strong>Pilih nomor permintaan atau tombol Tinjau untuk melihat detailnya.</li>
        <li><strong>Periksa informasi</strong>Tinjau data pemohon, nilai permintaan, dan alur persetujuan sebelumnya.</li>
        <li><strong>Berikan keputusan</strong>Pilih Setujui atau Tolak. Sistem akan memperbarui alur persetujuan.</li>
      </ol>
    </details>
  )
}

const PAGE_SIZE = 20

export default function InboxPage() {
  const navigate = useNavigate()
  const screens = Grid.useBreakpoint()
  const { userId } = useCurrentUser()
  const [items, setItems] = useState<InboxItem[] | null>(null)
  const [total, setTotal] = useState(0)
  const [page, setPage] = useState(1)
  const [error, setError] = useState<string | null>(null)
  const [refreshing, setRefreshing] = useState(true)
  const [revision, setRevision] = useState(0)
  const [search, setSearch] = useState('')
  const query = useDeferredValue(search.trim().toLowerCase())
  const [docType, setDocType] = useState<string>()

  useEffect(() => {
    if (!userId) return
    let cancelled = false
    getInbox(userId, page, PAGE_SIZE)
      .then((data) => { if (!cancelled) { setItems(data.items); setTotal(data.meta.total); setError(null) } })
      .catch((err) => { if (!cancelled) setError(getErrorMessage(err)) })
      .finally(() => { if (!cancelled) setRefreshing(false) })
    return () => { cancelled = true }
  }, [userId, page, revision])

  const stats = useMemo(() => {
    const list = items ?? []
    return {
      count: total,
      apps: new Set(list.map((item) => item.request.app_id)).size,
      totalAmount: list.reduce((sum, item) => sum + (payloadAmount(item.request.payload) ?? 0), 0),
      oldest: [...list].sort((a, b) => parseServerDate(a.request.created_at).getTime() - parseServerDate(b.request.created_at).getTime())[0],
    }
  }, [items, total])
  const filtered = useMemo(() => (items ?? [])
    .filter((item) => (!docType || item.request.doc_type === docType) &&
      [item.request.resource_id, item.request.requester_id, item.request.app_id, item.request.doc_type, item.step_name].some((value) => value.toLowerCase().includes(query)))
    .sort((a, b) => parseServerDate(a.request.created_at).getTime() - parseServerDate(b.request.created_at).getTime()), [items, query, docType])

  const columns: ColumnsType<InboxItem> = [
    { title: 'Permintaan', key: 'request', width: screens.md ? 240 : undefined, render: (_, item) => <div>
      <Link className="request-link" to={`/requests/${item.request.id}`}>{item.request.resource_id}</Link>
      <p className="mt-1 text-xs text-[var(--ae-text-secondary)]" title={item.request.app_id}>{item.request.doc_type.replaceAll('_', ' ')} · {item.request.app_id.slice(0, 12)}</p>
      <div className="mt-2 text-xs text-[var(--ae-text-secondary)] md:hidden"><p>{item.step_name} · {item.request.current_step_order}/{item.total_steps}</p><p className="mt-1">{item.request.requester_id} · {relativeTime(item.request.created_at)}</p>{payloadAmount(item.request.payload) !== null && <p className="mt-2 font-medium text-[var(--ae-text)]">{formatRupiah(payloadAmount(item.request.payload)!)}</p>}</div>
    </div> },
    { title: 'Pemohon', key: 'requester', responsive: ['md'], render: (_, item) => <span className="text-sm">{item.request.requester_id}</span> },
    { title: 'Nilai', key: 'amount', responsive: ['md'], align: 'right', render: (_, item) => {
      const amount = payloadAmount(item.request.payload)
      return <span className="whitespace-nowrap text-sm" style={{ fontVariantNumeric: 'tabular-nums' }}>{amount === null ? '—' : formatRupiah(amount)}</span>
    } },
    { title: 'Tahap saat ini', key: 'step', responsive: ['md'], render: (_, item) => <div><p className="mb-1 text-sm">{item.step_name}</p><StepProgress current={item.request.current_step_order} total={item.total_steps} /></div> },
    { title: 'Diajukan', key: 'created', responsive: ['md'], sorter: (a, b) => parseServerDate(a.request.created_at).getTime() - parseServerDate(b.request.created_at).getTime(), render: (_, item) => <time dateTime={parseServerDate(item.request.created_at).toISOString()} title={parseServerDate(item.request.created_at).toLocaleString('id-ID')} className="whitespace-nowrap text-sm text-[var(--ae-text-secondary)]">{relativeTime(item.request.created_at)}</time> },
    { title: 'Aksi', key: 'action', width: 84, align: 'right', render: (_, item) => <Link to={`/requests/${item.request.id}`} aria-label={`Tinjau ${item.request.resource_id}`} className="request-link">Tinjau</Link> },
  ]

  return (
    <div>
      <PageHeading title="Kotak masuk" description="Tinjau dan proses permintaan yang menunggu persetujuan Anda."
        action={<Button icon={<ReloadOutlined />} loading={refreshing} onClick={() => { setRefreshing(true); setError(null); setRevision((value) => value + 1) }}>Muat ulang</Button>} />
      {error && <Alert className="mb-5" type="error" showIcon message="Permintaan belum dapat dimuat" description={<>{error} Pilih Muat ulang untuk mencoba kembali.{items && ' Daftar di bawah menampilkan data terakhir yang berhasil dimuat.'}</>} />}
      {items === null ? (!error && <div className="ae-panel p-6"><Skeleton active paragraph={{ rows: 6 }} /></div>) : <>
        <dl className="inbox-summary" aria-label="Ringkasan kotak masuk">
          <div><dt>Menunggu persetujuan</dt><dd>{stats.count} <span className="text-sm font-normal">permintaan</span></dd><small>Dari {stats.apps} aplikasi di halaman ini</small></div>
          <div><dt>Menunggu terlama (halaman ini)</dt><dd>{stats.oldest ? relativeTime(stats.oldest.request.created_at) : '—'}</dd><small>{stats.oldest?.request.resource_id ?? 'Tidak ada permintaan tertunda'}</small></div>
          <div><dt>Nilai permintaan (halaman ini)</dt><dd>{formatRupiah(stats.totalAmount)}</dd><small>Akumulasi nilai di halaman ini</small></div>
        </dl>
        <section className="ae-panel" aria-label="Daftar permintaan">
          <div className="inbox-toolbar">
            <div style={{ flex: 1 }}><label htmlFor="inbox-search">Cari permintaan</label><Input id="inbox-search" prefix={<SearchOutlined />} placeholder="Nomor permintaan, pemohon, atau aplikasi" value={search} onChange={(event) => setSearch(event.target.value)} allowClear /></div>
            <div style={{ width: 230 }}><label htmlFor="inbox-doc-type">Jenis dokumen</label><Select id="inbox-doc-type" style={{ width: '100%' }} placeholder="Semua jenis dokumen" value={docType} onChange={setDocType} allowClear options={[...new Set(items.map((item) => item.request.doc_type))].map((value) => ({ value, label: value.replaceAll('_', ' ') }))} /></div>
          </div>
          <div className="flex flex-wrap justify-between gap-2 px-5 py-3 text-xs text-[var(--ae-text-secondary)]"><span role="status">{filtered.length} dari {items.length} permintaan di halaman ini · {total} total menunggu</span><span>Urutan awal: pengajuan terlama</span></div>
          <Table className="inbox-table" columns={columns} dataSource={filtered} rowKey={(item) => item.assignment.id} scroll={screens.md ? { x: 920 } : undefined}
            onRow={(item) => ({ style: { cursor: 'pointer' }, onClick: (event) => { if (!(event.target as HTMLElement).closest('a, button')) navigate(`/requests/${item.request.id}`) } })}
            pagination={{ current: page, pageSize: PAGE_SIZE, total, hideOnSinglePage: true, showSizeChanger: false, onChange: setPage }}
            locale={{ emptyText: <div className="py-8"><Empty image={Empty.PRESENTED_IMAGE_SIMPLE} description={items.length === 0 ? <><strong>Tidak ada permintaan yang menunggu</strong><p className="mt-2">Permintaan akan tersedia saat Anda mendapat giliran persetujuan.<br />Pilih Muat ulang untuk memeriksa permintaan terbaru.</p></> : <><strong>Tidak ada hasil yang sesuai</strong><p className="mt-2">Coba kata kunci lain atau hapus filter pencarian.</p></>} />{items.length > 0 && <Button className="mt-3" onClick={() => { setSearch(''); setDocType(undefined) }}>Hapus filter</Button>}</div> }} />
        </section>
        <HowItWorks />
      </>}
    </div>
  )
}
