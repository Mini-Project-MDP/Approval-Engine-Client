import { useState, type SubmitEvent } from 'react'
import { Navigate, useNavigate } from 'react-router-dom'
import { Button, Input } from 'antd'
import { ArrowRightOutlined } from '@ant-design/icons'
import BrandMark from '../components/layout/BrandMark'
import { useCurrentUser } from '../context/CurrentUserContext'

const DEMO_USERS = [
  { id: 'SA01', label: 'Sales Admin' },
  { id: 'SS01', label: 'Supervisor' },
  { id: 'RSM1', label: 'RSM' },
  { id: 'AST01', label: 'Asset Officer' },
]

export default function LoginPage() {
  const [nik, setNik] = useState('')
  const { userId, login } = useCurrentUser()
  const navigate = useNavigate()
  if (userId) return <Navigate to="/inbox" replace />

  function enterAs(id: string) { login(id); navigate('/inbox') }
  function handleSubmit(e: SubmitEvent<HTMLFormElement>) {
    e.preventDefault()
    if (nik.trim()) enterAs(nik)
  }

  return (
    <div className="login-page">
      <header className="login-header">
        <div className="portal-brand"><BrandMark size={32} /><div><strong>Approval Engine</strong><p>Portal persetujuan</p></div></div>
      </header>
      <main className="login-main">
        <section className="login-intro">
          <h1>Semua persetujuan dalam satu tempat.</h1>
          <p>Tinjau permintaan dari aplikasi yang terhubung, periksa alur persetujuan, dan berikan keputusan Anda.</p>
          <ol className="login-steps">
            <li>Masuk menggunakan NIK Anda.</li>
            <li>Buka permintaan di kotak masuk.</li>
            <li>Periksa detail, lalu setujui atau tolak.</li>
          </ol>
        </section>
        <section className="ae-panel login-form" aria-labelledby="login-title">
          <h2 id="login-title">Masuk ke portal</h2>
          <p>Gunakan NIK yang terdaftar sebagai penerima persetujuan.</p>
          <form onSubmit={handleSubmit} className="mt-6">
            <label htmlFor="nik">Nomor Induk Karyawan (NIK)</label>
            <Input id="nik" size="large" value={nik} onChange={(e) => setNik(e.target.value)} placeholder="NIK, mis. SS01" autoComplete="username" autoCapitalize="characters" spellCheck={false} required aria-describedby="nik-help" />
            <p id="nik-help" className="mt-2" style={{ fontSize: 12 }}>Permintaan ditampilkan sesuai NIK yang Anda masukkan.</p>
            <Button className="mt-5" block size="large" type="primary" htmlType="submit" disabled={!nik.trim()} icon={<ArrowRightOutlined aria-hidden="true" />} iconPosition="end">Masuk</Button>
          </form>
          <details className="login-demo">
            <summary>Coba dengan akun demo</summary>
            <div className="mt-2 grid grid-cols-1 gap-2">
              {DEMO_USERS.map((u) => <Button key={u.id} onClick={() => enterAs(u.id)}><span className="font-medium">{u.id}</span><span>{u.label}</span></Button>)}
            </div>
          </details>
        </section>
      </main>
      <footer className="login-footer">Approval Engine · Portal persetujuan terpusat</footer>
    </div>
  )
}
