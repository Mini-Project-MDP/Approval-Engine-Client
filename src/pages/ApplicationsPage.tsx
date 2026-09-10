import { useEffect, useState } from 'react'
import { Alert, App, Button, Card, Empty, Form, Input, Skeleton, Tag, Typography } from 'antd'
import { PlusOutlined } from '@ant-design/icons'
import PageHeading from '../components/common/PageHeading'
import { createApplication, listApplications } from '../services/api/applicationService'
import { getErrorMessage } from '../utils/errors'
import { color } from '../theme/tokens'
import type { Application } from '../types/domain'

export default function ApplicationsPage() {
  const { message } = App.useApp()
  const [form] = Form.useForm()
  const [apps, setApps] = useState<Application[] | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [submitting, setSubmitting] = useState(false)
  const [justCreated, setJustCreated] = useState<Application | null>(null)

  function load() {
    listApplications()
      .then(setApps)
      .catch((err) => setError(getErrorMessage(err)))
  }

  useEffect(load, [])

  async function handleSubmit(values: { code: string; name: string }) {
    setSubmitting(true)
    setError(null)
    try {
      const app = await createApplication(values)
      setJustCreated(app)
      form.resetFields()
      message.success('Aplikasi terdaftar')
      load()
    } catch (err) {
      setError(getErrorMessage(err))
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="space-y-5">
      <PageHeading title="Aplikasi" description="Kelola aplikasi yang terhubung ke portal persetujuan. Daftarkan aplikasi sebelum membuat workflow." />
      {justCreated && (
        <Alert
          showIcon
          type="warning"
          closable
          onClose={() => setJustCreated(null)}
          message={`Aplikasi "${justCreated.name}" dibuat`}
          description={
            <div className="mt-1.5">
              <p className="mb-1.5 text-xs">Simpan API key ini sekarang — tidak akan ditampilkan lagi.</p>
              <Typography.Text code copyable className="font-data">
                {justCreated.api_key}
              </Typography.Text>
            </div>
          }
        />
      )}

      <Card variant="borderless" style={{ border: `1px solid ${color.border}` }}>
        <Typography.Title level={5} style={{ marginTop: 0 }}>
          Daftarkan aplikasi baru
        </Typography.Title>
        <p className="mb-4 text-[13px]" style={{ color: color.textSecondary }}>
          Daftarkan sistem sumber, seperti Asset Management, untuk mendapatkan API key integrasi.
        </p>
        <Form form={form} layout="vertical" onFinish={handleSubmit} className="application-form" requiredMark={false}>
          <Form.Item label="Kode aplikasi" name="code" rules={[{ required: true, whitespace: true, message: 'Masukkan kode aplikasi' }]}>
            <Input placeholder="code, mis. assetmgmt" />
          </Form.Item>
          <Form.Item label="Nama aplikasi" name="name" rules={[{ required: true, whitespace: true, message: 'Masukkan nama aplikasi' }]}>
            <Input placeholder="Nama, mis. Asset Management" />
          </Form.Item>
          <Button type="primary" htmlType="submit" icon={<PlusOutlined />} loading={submitting}>
            Daftarkan
          </Button>
        </Form>
        {error && (
          <Alert className="mt-3" type="error" showIcon message={error} />
        )}
      </Card>

      <div className="ae-panel">
        <div className="px-5 py-4" style={{ borderBottom: `1px solid ${color.border}` }}>
          <Typography.Title level={5} style={{ margin: 0 }}>
            Aplikasi terdaftar
          </Typography.Title>
        </div>
        {apps === null ? (
          <div className="p-5">
            <Skeleton active paragraph={{ rows: 3 }} />
          </div>
        ) : apps.length === 0 ? (
          <div className="px-5 py-12">
            <Empty image={Empty.PRESENTED_IMAGE_SIMPLE} description="Belum ada aplikasi. Isi formulir di atas untuk mendaftarkan aplikasi pertama." />
          </div>
        ) : (
          <ul>
            {apps.map((a) => (
              <li
                key={a.id}
                className="flex items-center justify-between gap-4 px-5 py-4"
                style={{ borderBottom: `1px solid ${color.border}` }}
              >
                <div className="min-w-0">
                  <div>
                    <p className="break-words text-sm font-semibold">{a.name}</p>
                    <p className="mt-1 break-all text-xs" style={{ color: color.textTertiary }}>
                      {a.code}
                    </p>
                  </div>
                </div>
                {a.is_active ? (
                  <Tag color="success" bordered={false}>
                    Aktif
                  </Tag>
                ) : (
                  <Tag bordered={false}>Nonaktif</Tag>
                )}
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  )
}
