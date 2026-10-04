import { useEffect, useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import { App, Alert, Button, Card, Form, Input, Select, Skeleton, Typography } from 'antd'
import { PlusOutlined } from '@ant-design/icons'
import { listApplications } from '../services/api/applicationService'
import { getWorkflow, publishWorkflow } from '../services/api/workflowService'
import { getErrorMessage } from '../utils/errors'
import { color } from '../theme/tokens'
import PageHeading from '../components/common/PageHeading'
import StepEditor, { toStepInputs } from '../components/workflow/StepEditor'
import type { PublishWorkflowInput } from '../services/api/workflowService'
import type { Application, WorkflowDefinition } from '../types/domain'

type StepFormValue = PublishWorkflowInput['steps'][number] & { hasCondition?: boolean }

const DEFAULT_STEP = {
  resolver_rule: { type: 'superior', level: 1 },
  approval_mode: 'any',
  on_empty: 'fail',
}

// Maps a stored workflow version back into the form's shape, so editing
// starts from exactly what is published today.
function toFormValues(def: WorkflowDefinition) {
  return {
    app_id: def.app_id,
    doc_type: def.doc_type,
    name: def.name,
    steps: (def.steps ?? []).map((s) => ({
      name: s.name,
      resolver_rule: s.resolver_rule,
      condition: s.condition ?? undefined,
      hasCondition: Boolean(s.condition),
      approval_mode: s.approval_mode,
      on_empty: s.on_empty,
    })),
  }
}

export default function WorkflowFormPage() {
  const navigate = useNavigate()
  const { id } = useParams<{ id: string }>()
  const isEdit = Boolean(id)
  const { message } = App.useApp()
  const [form] = Form.useForm()
  const [apps, setApps] = useState<Application[]>([])
  const [loadingApps, setLoadingApps] = useState(true)
  const [editing, setEditing] = useState<WorkflowDefinition | null>(null)
  const [loadingWorkflow, setLoadingWorkflow] = useState(isEdit)
  const [error, setError] = useState<string | null>(null)
  const [submitting, setSubmitting] = useState(false)

  useEffect(() => {
    listApplications(1, 100)
      .then((data) => {
        setApps(data.items)
        // Editing keeps the workflow's own app; only a new workflow gets a default.
        if (!isEdit && data.items.length > 0) form.setFieldValue('app_id', data.items[0].id)
      })
      .catch((err) => setError(getErrorMessage(err)))
      .finally(() => setLoadingApps(false))
  }, [form, isEdit])

  useEffect(() => {
    if (!id) return
    getWorkflow(id)
      .then((def) => {
        setEditing(def)
        form.setFieldsValue(toFormValues(def))
      })
      .catch((err) => setError(getErrorMessage(err)))
      .finally(() => setLoadingWorkflow(false))
  }, [form, id])

  // The form can only edit a step's single `condition`; saving a step that
  // uses compound `conditions` would silently drop them, so block it.
  const hasCompoundConditions = Boolean(editing?.steps?.some((s) => (s.conditions?.length ?? 0) > 0))

  async function handleFinish(values: { app_id: string; doc_type: string; name: string; steps: StepFormValue[] }) {
    setError(null)
    setSubmitting(true)
    try {
      await publishWorkflow({ ...values, steps: toStepInputs(values.steps) })
      message.success(isEdit ? 'Versi baru workflow dipublikasikan' : 'Workflow dipublikasikan')
      navigate('/workflows')
    } catch (err) {
      setError(getErrorMessage(err))
    } finally {
      setSubmitting(false)
    }
  }

  if (loadingWorkflow) {
    return (
      <div className="ae-panel p-5">
        <Skeleton active paragraph={{ rows: 6 }} />
      </div>
    )
  }

  return (
    <Form form={form} layout="vertical" onFinish={handleFinish} initialValues={{ steps: [DEFAULT_STEP] }} requiredMark={false}>
      {isEdit ? (
        <PageHeading
          title="Edit workflow"
          description={editing
            ? `Menyimpan perubahan akan menerbitkan v${editing.version + 1} dan menonaktifkan versi lama. Permintaan yang sedang berjalan tetap memakai versi lamanya.`
            : 'Workflow tidak dapat dimuat.'}
        />
      ) : (
        <PageHeading title="Workflow baru" description="Tentukan aplikasi dan dokumen, lalu susun tahap persetujuan sesuai urutan proses." />
      )}
      {hasCompoundConditions && (
        <Alert
          className="mb-4"
          type="warning"
          showIcon
          message="Workflow ini memakai kombinasi beberapa syarat (conditions) yang belum didukung form ini."
          description="Ubah workflow ini lewat API agar syaratnya tidak hilang."
        />
      )}
      <Card variant="borderless" style={{ border: `1px solid ${color.border}`, marginBottom: 16 }}>
        <Typography.Title level={5} style={{ marginTop: 0 }}>
          Informasi workflow
        </Typography.Title>
        <p className="mb-4 text-[13px]" style={{ color: color.textSecondary }}>
          Menyimpan workflow untuk aplikasi dan jenis dokumen yang sama akan menerbitkan versi baru.
          Permintaan yang sedang berjalan tetap menggunakan versi sebelumnya.
        </p>

        {loadingApps ? <p role="status">Memuat aplikasi…</p> : apps.length === 0 ? (
          <Alert type={error ? 'error' : 'info'} showIcon message={error ? 'Daftar aplikasi belum dapat dimuat.' : 'Daftarkan aplikasi sebelum membuat workflow.'} description={<Link to="/applications">Buka halaman Aplikasi</Link>} />
        ) : (
          <div className="grid grid-cols-1 gap-x-4 sm:grid-cols-2">
            <Form.Item label="Aplikasi" name="app_id" rules={[{ required: true }]}>
              <Select
                showSearch
                virtual={false}
                disabled={isEdit}
                optionFilterProp="label"
                options={apps.map((a) => ({ value: a.id, label: a.name }))}
              />
            </Form.Item>
            <Form.Item label="Jenis dokumen (doc_type)" name="doc_type" rules={[{ required: true, message: 'Wajib diisi' }]}>
              <Input placeholder="mis. purchase_order" disabled={isEdit} />
            </Form.Item>
            <Form.Item
              label="Nama workflow"
              name="name"
              rules={[{ required: true, message: 'Wajib diisi' }]}
              className="sm:col-span-2"
            >
              <Input placeholder="mis. PO Approval" />
            </Form.Item>
          </div>
        )}
      </Card>

      <div className="mb-4 mt-6"><h2 className="text-base font-semibold">Tahap persetujuan</h2><p className="mt-1 text-sm text-[var(--ae-text-secondary)]">Tahap dijalankan berurutan dari atas ke bawah. Tentukan penerima pada setiap tahap.</p></div>
      <Form.List name="steps">
        {(fields, { add, remove }) => (
          <div className="space-y-3">
            {fields.map((field, index) => (
              <StepEditor
                key={field.key}
                field={field}
                index={index}
                onRemove={() => remove(field.name)}
                canRemove={fields.length > 1}
              />
            ))}
            <Button block icon={<PlusOutlined />} onClick={() => add(DEFAULT_STEP)} style={{ borderStyle: 'dashed' }}>
              Tambah step
            </Button>
          </div>
        )}
      </Form.List>

      {error && (
        <Alert className="mt-4" type="error" showIcon message={error} />
      )}

      <div className="mt-5 flex gap-2">
        <Button type="primary" htmlType="submit" loading={submitting} disabled={apps.length === 0 || (isEdit && !editing) || hasCompoundConditions}>
          {isEdit ? 'Simpan sebagai versi baru' : 'Simpan workflow'}
        </Button>
        <Button onClick={() => navigate('/workflows')}>Batal</Button>
      </div>
    </Form>
  )
}
