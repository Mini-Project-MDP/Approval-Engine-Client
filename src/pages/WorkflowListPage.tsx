import { useEffect, useMemo, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { App, Button, Empty, Popconfirm, Skeleton, Table, Tag, Typography } from 'antd'
import type { ColumnsType } from 'antd/es/table'
import { PlusOutlined } from '@ant-design/icons'
import { deactivateWorkflow, listWorkflows } from '../services/api/workflowService'
import { listApplications } from '../services/api/applicationService'
import { getErrorMessage } from '../utils/errors'
import PageHeading from '../components/common/PageHeading'
import type { WorkflowDefinition } from '../types/domain'

const PAGE_SIZE = 20

export default function WorkflowListPage() {
  const { message } = App.useApp()
  const navigate = useNavigate()
  const [workflows, setWorkflows] = useState<WorkflowDefinition[] | null>(null)
  const [total, setTotal] = useState(0)
  const [page, setPage] = useState(1)
  const [appNames, setAppNames] = useState<Record<string, string>>({})
  const [error, setError] = useState<string | null>(null)

  function load() {
    listWorkflows(undefined, page, PAGE_SIZE)
      .then((data) => { setWorkflows(data.items); setTotal(data.meta.total) })
      .catch((err) => setError(getErrorMessage(err)))
    listApplications(1, 100)
      .then((data) => setAppNames(Object.fromEntries(data.items.map((a) => [a.id, a.name]))))
      .catch(() => {
        // Non-fatal: worst case the table falls back to showing raw app ids.
      })
  }

  useEffect(load, [page])

  async function handleDeactivate(id: string) {
    try {
      await deactivateWorkflow(id)
      message.success('Workflow dinonaktifkan')
      load()
    } catch (err) {
      message.error(getErrorMessage(err))
    }
  }

  const columns: ColumnsType<WorkflowDefinition> = useMemo(
    () => [
      {
        title: 'Aplikasi',
        dataIndex: 'app_id',
        render: (appId: string) => appNames[appId] ?? <span className="font-data text-xs">{appId.slice(0, 8)}</span>,
      },
      { title: 'Jenis dokumen', dataIndex: 'doc_type', render: (v: string) => <span className="font-data text-[13px]">{v}</span> },
      { title: 'Nama', dataIndex: 'name', render: (v: string) => <span className="font-semibold">{v}</span> },
      { title: 'Versi', dataIndex: 'version', render: (v: number) => `v${v}` },
      {
        title: 'Status',
        dataIndex: 'is_active',
        render: (active: boolean) =>
          active ? (
            <Tag color="success" bordered={false}>
              Aktif
            </Tag>
          ) : (
            <Tag bordered={false}>Nonaktif</Tag>
          ),
      },
      {
        title: '',
        key: 'action',
        align: 'right',
        render: (_, w) =>
          w.is_active && (
            <Popconfirm
              title={`Nonaktifkan "${w.name}"?`}
              description="Request yang sedang berjalan tidak terpengaruh."
              okText="Ya, nonaktifkan"
              cancelText="Batal"
              okButtonProps={{ danger: true }}
              onConfirm={() => handleDeactivate(w.id)}
            >
              <Button type="link" danger size="small">
                Nonaktifkan
              </Button>
            </Popconfirm>
          ),
      },
    ],
    [appNames, handleDeactivate],
  )

  return (
    <div className="space-y-4">
      <PageHeading title="Workflow" description="Atur urutan persetujuan untuk setiap aplikasi dan jenis dokumen." action={
        <Button type="primary" icon={<PlusOutlined />} onClick={() => navigate('/workflows/new')}>
          Workflow baru
        </Button>
      } />

      {error && <Typography.Text type="danger">{error}</Typography.Text>}

      <div className="ae-panel">
        {workflows === null ? (
          <div className="p-5">
            <Skeleton active paragraph={{ rows: 4 }} />
          </div>
        ) : workflows.length === 0 ? (
          <div className="px-5 py-12">
            <Empty image={Empty.PRESENTED_IMAGE_SIMPLE} description="Belum ada workflow. Buat alur pertama untuk menentukan penerima dan urutan persetujuan.">
              <Link to="/workflows/new">
                <Button type="primary" icon={<PlusOutlined />}>
                  Buat workflow pertama
                </Button>
              </Link>
            </Empty>
          </div>
        ) : (
          <Table columns={columns} dataSource={workflows} rowKey="id" scroll={{ x: 640 }}
            pagination={{ current: page, pageSize: PAGE_SIZE, total, hideOnSinglePage: true, showSizeChanger: false, onChange: setPage }} />
        )}
      </div>
    </div>
  )
}
