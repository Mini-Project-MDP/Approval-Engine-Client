import { Button, Checkbox, Form, Input, InputNumber, Select, type FormListFieldData } from 'antd'
import { DeleteOutlined } from '@ant-design/icons'
import type { PublishWorkflowInput } from '../../services/api/workflowService'

const RESOLVER_OPTIONS = [
  { value: 'superior', label: 'Atasan (naik N level)' },
  { value: 'role', label: 'Jabatan tertentu' },
  { value: 'static', label: 'Orang tetap' },
  { value: 'field', label: 'Dari data request' },
]

const OP_OPTIONS = [
  { value: 'eq', label: 'sama dengan (=)' },
  { value: 'ne', label: 'tidak sama (≠)' },
  { value: 'gt', label: 'lebih besar (>)' },
  { value: 'gte', label: 'lebih besar sama dengan (≥)' },
  { value: 'lt', label: 'lebih kecil (<)' },
  { value: 'lte', label: 'lebih kecil sama dengan (≤)' },
  { value: 'in', label: 'salah satu dari (in)' },
]

interface StepEditorProps {
  field: FormListFieldData
  index: number
  onRemove: () => void
  canRemove: boolean
}

export default function StepEditor({ field, index, onRemove, canRemove }: StepEditorProps) {
  return (
    <div className="ae-panel p-5">
      <div className="mb-3 flex items-center justify-between">
        <span
          className="text-sm font-semibold"
        >
          Tahap {index + 1}
        </span>
        {canRemove && (
          <Button type="text" danger size="small" icon={<DeleteOutlined />} onClick={onRemove}>
            Hapus
          </Button>
        )}
      </div>

      <Form.Item
        {...field}
        label="Nama tahap"
        name={[field.name, 'name']}
        rules={[{ required: true, message: 'Nama step wajib diisi' }]}
        style={{ marginBottom: 12 }}
      >
        <Input placeholder="Nama step, mis. Supervisor Approval" />
      </Form.Item>

      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
        <Form.Item
          {...field}
          label="Approver ditentukan oleh"
          name={[field.name, 'resolver_rule', 'type']}
          initialValue="superior"
          style={{ marginBottom: 12 }}
        >
          <Select virtual={false} options={RESOLVER_OPTIONS} />
        </Form.Item>

        <Form.Item noStyle shouldUpdate>
          {({ getFieldValue }) => {
            const type = getFieldValue(['steps', field.name, 'resolver_rule', 'type'])

            if (type === 'superior') {
              return (
                <Form.Item
                  {...field}
                  label="Berapa level ke atas"
                  name={[field.name, 'resolver_rule', 'level']}
                  initialValue={1}
                  style={{ marginBottom: 12 }}
                >
                  <InputNumber min={1} style={{ width: '100%' }} />
                </Form.Item>
              )
            }
            if (type === 'static') {
              return (
                <Form.Item
                  {...field}
                  label="NIK approver"
                  name={[field.name, 'resolver_rule', 'user_id']}
                  rules={[{ required: true, message: 'NIK wajib diisi' }]}
                  style={{ marginBottom: 12 }}
                >
                  <Input placeholder="mis. GDH01" />
                </Form.Item>
              )
            }
            if (type === 'field') {
              return (
                <Form.Item
                  {...field}
                  label="Nama field di data request"
                  name={[field.name, 'resolver_rule', 'path']}
                  rules={[{ required: true, message: 'Nama field wajib diisi' }]}
                  style={{ marginBottom: 12 }}
                >
                  <Input placeholder="mis. approver_nik" />
                </Form.Item>
              )
            }
            return (
              <Form.Item
                {...field}
                label="Jabatan"
                name={[field.name, 'resolver_rule', 'position']}
                rules={[{ required: true, message: 'Jabatan wajib diisi' }]}
                style={{ marginBottom: 12 }}
              >
                <Input placeholder="mis. Asset Officer" />
              </Form.Item>
            )
          }}
        </Form.Item>

        <Form.Item noStyle shouldUpdate>
          {({ getFieldValue }) =>
            getFieldValue(['steps', field.name, 'resolver_rule', 'type']) === 'role' && (
              <>
                <Form.Item
                  {...field}
                  label="Departemen (kosongkan untuk lintas fungsi manual)"
                  name={[field.name, 'resolver_rule', 'department']}
                  style={{ marginBottom: 12 }}
                >
                  <Input placeholder="mis. System Support" />
                </Form.Item>
                <Form.Item
                  {...field}
                  name={[field.name, 'resolver_rule', 'scope']}
                  valuePropName="checked"
                  getValueFromEvent={(checked: boolean) => (checked ? 'same_department' : undefined)}
                  getValueProps={(value) => ({ checked: value === 'same_department' })}
                  className="sm:col-span-2"
                  style={{ marginBottom: 12 }}
                >
                  <Checkbox>Batasi ke departemen yang sama dengan pemohon (bukan lintas fungsi)</Checkbox>
                </Form.Item>
              </>
            )
          }
        </Form.Item>

        <Form.Item
          {...field}
          label="Mode approval"
          name={[field.name, 'approval_mode']}
          initialValue="any"
          style={{ marginBottom: 12 }}
        >
          <Select
            virtual={false}
            options={[
              { value: 'any', label: 'Salah satu cukup' },
              { value: 'all', label: 'Semua harus setuju' },
            ]}
          />
        </Form.Item>

        <Form.Item
          {...field}
          label="Jika tidak ada approver ditemukan"
          name={[field.name, 'on_empty']}
          initialValue="fail"
          style={{ marginBottom: 12 }}
        >
          <Select
            virtual={false}
            options={[
              { value: 'fail', label: 'Tahan request (perlu ditinjau manual)' },
              { value: 'skip', label: 'Lewati step ini' },
            ]}
          />
        </Form.Item>
      </div>

      <Form.Item
        {...field}
        name={[field.name, 'hasCondition']}
        valuePropName="checked"
        style={{ marginBottom: 8, marginTop: 4 }}
      >
        <Checkbox>Jalankan step ini hanya jika syarat terpenuhi</Checkbox>
      </Form.Item>

      <Form.Item noStyle shouldUpdate>
        {({ getFieldValue }) =>
          getFieldValue(['steps', field.name, 'hasCondition']) && (
            <div className="grid grid-cols-1 gap-2 sm:grid-cols-3">
              <Form.Item
                {...field}
                label="Field data"
                name={[field.name, 'condition', 'field']}
                rules={[{ required: true, message: 'Wajib' }]}
                style={{ marginBottom: 0 }}
              >
                <Input placeholder="field, mis. amount" />
              </Form.Item>
              <Form.Item
                {...field}
                label="Perbandingan"
                name={[field.name, 'condition', 'op']}
                initialValue="gt"
                style={{ marginBottom: 0 }}
              >
                <Select virtual={false} options={OP_OPTIONS} />
              </Form.Item>
              <Form.Item
                {...field}
                label="Nilai pembanding"
                name={[field.name, 'condition', 'value']}
                rules={[{ required: true, message: 'Wajib' }]}
                style={{ marginBottom: 0 }}
              >
                <Input placeholder="nilai, mis. 50000000" />
              </Form.Item>
            </div>
          )
        }
      </Form.Item>
    </div>
  )
}

/** Strips the form's `hasCondition` UI checkbox down to the API's
 * `condition: null` shape before publishing. */
export function toStepInputs(
  steps: Array<PublishWorkflowInput['steps'][number] & { hasCondition?: boolean }>,
): PublishWorkflowInput['steps'] {
  return steps.map(({ hasCondition, ...rest }) => ({ ...rest, condition: hasCondition ? rest.condition : null }))
}
