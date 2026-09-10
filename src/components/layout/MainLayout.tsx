import { useMemo, useState, type ReactNode } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import { Layout, Menu, Avatar, Button, Drawer, Grid } from 'antd'
import { InboxOutlined, ApartmentOutlined, ApiOutlined, LogoutOutlined, MenuFoldOutlined, MenuUnfoldOutlined } from '@ant-design/icons'
import BrandMark from './BrandMark'
import { useCurrentUser } from '../../context/CurrentUserContext'
import { color } from '../../theme/tokens'
import { initials } from '../../utils/avatar'

const { Sider, Header, Content } = Layout
// Grouping describes tasks; it does not confer administrative permissions.
const NAV_ITEMS = [
  { key: 'approval', type: 'group' as const, label: 'Persetujuan', children: [
    { key: '/inbox', icon: <InboxOutlined />, label: 'Kotak masuk' },
  ] },
  { key: 'admin', type: 'group' as const, label: 'Administrasi', children: [
    { key: '/workflows', icon: <ApartmentOutlined />, label: 'Workflow' },
    { key: '/applications', icon: <ApiOutlined />, label: 'Aplikasi' },
  ] },
]

export default function MainLayout({ children }: { children: ReactNode }) {
  const { userId, logout } = useCurrentUser()
  const location = useLocation()
  const navigate = useNavigate()
  const [collapsed, setCollapsed] = useState(false)
  const [mobileOpen, setMobileOpen] = useState(false)
  const screens = Grid.useBreakpoint()
  const desktop = Boolean(screens.lg)
  const selectedKey = useMemo(() => {
    if (location.pathname.startsWith('/workflows')) return '/workflows'
    if (location.pathname.startsWith('/applications')) return '/applications'
    return '/inbox'
  }, [location.pathname])
  if (!userId) return <>{children}</>

  const sidebar = (
    <div className="sidebar-inner">
      <div className="portal-brand">
        <BrandMark size={32} />
        <div><strong>Approval Engine</strong><p>Portal persetujuan</p></div>
      </div>
      <nav className="portal-nav" aria-label="Navigasi utama">
        <Menu mode="inline" selectedKeys={[selectedKey]} items={NAV_ITEMS} style={{ border: 'none' }}
          onClick={({ key }) => { navigate(key); setMobileOpen(false) }} />
      </nav>
      <div className="sidebar-user">
        <Avatar size={34} style={{ background: color.bg, color: color.textSecondary, fontWeight: 600 }}>{initials(userId)}</Avatar>
        <div className="min-w-0 flex-1">
          <p className="text-xs text-[var(--ae-text-secondary)]">NIK pengguna</p>
          <p className="truncate text-sm font-semibold" title={userId}>{userId}</p>
        </div>
        <Button type="text" icon={<LogoutOutlined />} onClick={logout} aria-label="Keluar" title="Keluar" />
      </div>
    </div>
  )

  return (
    <Layout style={{ minHeight: '100dvh' }}>
      <a href="#main-content" className="skip-link">Lewati ke konten utama</a>
      {desktop && <Sider className="portal-sidebar" theme="light" width={232} collapsedWidth={0} collapsed={collapsed} trigger={null}>{!collapsed && sidebar}</Sider>}
      <Drawer title="Navigasi" placement="left" width={280} open={!desktop && mobileOpen} onClose={() => setMobileOpen(false)} styles={{ body: { padding: 0 } }}>{sidebar}</Drawer>
      <Layout style={{ minWidth: 0 }}>
        <Header className="portal-header">
          <Button type="text" icon={desktop && !collapsed ? <MenuFoldOutlined /> : <MenuUnfoldOutlined />}
            aria-label={desktop && !collapsed ? 'Tutup navigasi' : 'Buka navigasi'} aria-expanded={desktop ? !collapsed : mobileOpen}
            onClick={() => desktop ? setCollapsed(!collapsed) : setMobileOpen(!mobileOpen)} />
          <span className="text-sm text-[var(--ae-text-secondary)]">{selectedKey === '/inbox' ? 'Persetujuan' : 'Administrasi'}<span aria-hidden="true" className="mx-3">/</span><span className="font-medium text-[var(--ae-text)]">{selectedKey === '/inbox' ? 'Kotak masuk' : selectedKey === '/workflows' ? 'Workflow' : 'Aplikasi'}</span></span>
        </Header>
        <Content id="main-content" tabIndex={-1} className="portal-content">
          <div className="mx-auto max-w-7xl">{children}</div>
        </Content>
      </Layout>
    </Layout>
  )
}
