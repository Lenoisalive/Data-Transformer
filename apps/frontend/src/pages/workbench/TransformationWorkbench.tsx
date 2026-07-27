import React, { useEffect, useState } from 'react';
import {
  Button,
  Card,
  Empty,
  Form,
  Input,
  message,
  Modal,
  Popconfirm,
  Select,
  Space,
  Tag,
  Tooltip,
  Typography,
} from 'antd';
import {
  ArrowRightOutlined,
  DatabaseOutlined,
  DeleteOutlined,
  EditOutlined,
  FunctionOutlined,
  HolderOutlined,
  PlusOutlined,
  SaveOutlined,
  TableOutlined,
  ToolOutlined,
} from '@ant-design/icons';
import { useProject } from '../../contexts/ProjectContext';
import { datasourceService, DataSource } from '../../services/datasource.service';
import { exportTableService } from '../../services/export.service';
import { authService } from '../../services/auth.service';
import './TransformationWorkbench.css';

const { Paragraph, Text, Title } = Typography;

interface OutputField {
  id: string;
  name: string;
  type: string;
}

interface DirectPassMapping {
  inputFieldName: string;
  outputFieldId: string;
}

interface ConcatMapping {
  anchorInputFieldName: string;
  leftInputFieldName?: string;
  separator: string;
  rightInputFieldName?: string;
  outputFieldId?: string;
}

interface Pipeline {
  id: string;
  name: string;
  inputTableId?: string;
  outputTableName: string;
  outputFields: OutputField[];
  directPassMappings: DirectPassMapping[];
  concatMappings: ConcatMapping[];
}

interface FieldForm {
  name: string;
  type: string;
}

const fieldTypes = ['string', 'integer', 'decimal', 'boolean', 'date'];
const makeId = () => `${Date.now()}-${Math.random().toString(36).slice(2)}`;
const DRAFT_STORAGE_VERSION = 1;

const createEmptyPipeline = (): Pipeline => ({
  id: makeId(),
  name: 'Untitled pipeline',
  outputTableName: 'output_table',
  outputFields: [],
  directPassMappings: [],
  concatMappings: [],
});

interface StoredPipelineDrafts {
  version: number;
  activePipelineId: string;
  pipelines: Pipeline[];
  savedAt: string;
}

export const TransformationWorkbench: React.FC = () => {
  const { activeProject, refreshProjects } = useProject();
  const currentUser = authService.getUser();
  const [inputTables, setInputTables] = useState<DataSource[]>([]);
  const [pipelines, setPipelines] = useState<Pipeline[]>(() => [createEmptyPipeline()]);
  const [activePipelineId, setActivePipelineId] = useState(() => pipelines[0].id);
  const [newPipelineOpen, setNewPipelineOpen] = useState(false);
  const [fieldModalOpen, setFieldModalOpen] = useState(false);
  const [editingFieldId, setEditingFieldId] = useState<string>();
  const [running, setRunning] = useState(false);
  const [selectedInputFieldName, setSelectedInputFieldName] = useState<string>();
  const [selectedOutputFieldId, setSelectedOutputFieldId] = useState<string>();
  const [selectedRuleType, setSelectedRuleType] = useState<string>();
  const [draggedOutputFieldId, setDraggedOutputFieldId] = useState<string>();
  const [pipelineForm] = Form.useForm<{ name: string }>();
  const [fieldForm] = Form.useForm<FieldForm>();

  const pipeline = pipelines.find((item) => item.id === activePipelineId) || pipelines[0];
  const selectedInput = inputTables.find((table) => table.id === pipeline?.inputTableId);
  const inputFields = selectedInput?.schema?.columns || [];
  const selectedInputField = inputFields.find((field) => field.name === selectedInputFieldName);
  const selectedOutputField = pipeline?.outputFields.find((field) => field.id === selectedOutputFieldId);
  const selectedMapping = pipeline?.directPassMappings.find((mapping) =>
    selectedOutputFieldId
      ? mapping.outputFieldId === selectedOutputFieldId
      : mapping.inputFieldName === selectedInputFieldName,
  );
  const selectedConcatMapping = pipeline?.concatMappings.find((mapping) =>
    selectedOutputFieldId
      ? mapping.outputFieldId === selectedOutputFieldId
      : mapping.anchorInputFieldName === selectedInputFieldName,
  );

  const draftStorageKey = activeProject && currentUser
    ? `transformation-pipeline-drafts:v${DRAFT_STORAGE_VERSION}:${currentUser.id}:${activeProject.id}`
    : null;

  useEffect(() => {
    setSelectedInputFieldName(undefined);
    setSelectedOutputFieldId(undefined);
    setSelectedRuleType(undefined);

    if (!draftStorageKey) {
      const emptyPipeline = createEmptyPipeline();
      setPipelines([emptyPipeline]);
      setActivePipelineId(emptyPipeline.id);
      return;
    }

    try {
      const storedValue = localStorage.getItem(draftStorageKey);
      if (!storedValue) {
        const emptyPipeline = createEmptyPipeline();
        setPipelines([emptyPipeline]);
        setActivePipelineId(emptyPipeline.id);
        return;
      }

      const stored = JSON.parse(storedValue) as StoredPipelineDrafts;
      if (
        stored.version !== DRAFT_STORAGE_VERSION ||
        !Array.isArray(stored.pipelines) ||
        stored.pipelines.length === 0
      ) {
        throw new Error('Unsupported pipeline draft format');
      }

      const normalizedPipelines = stored.pipelines.map((item) => ({
        ...item,
        directPassMappings: item.directPassMappings || [],
        concatMappings: item.concatMappings || [],
      }));
      setPipelines(normalizedPipelines);
      setActivePipelineId(
        normalizedPipelines.some((item) => item.id === stored.activePipelineId)
          ? stored.activePipelineId
          : normalizedPipelines[0].id,
      );
    } catch {
      const emptyPipeline = createEmptyPipeline();
      setPipelines([emptyPipeline]);
      setActivePipelineId(emptyPipeline.id);
      message.warning('The saved pipeline draft could not be read and was reset');
    }
  }, [draftStorageKey]);

  useEffect(() => {
    const loadInputTables = async () => {
      if (!activeProject) {
        setInputTables([]);
        return;
      }
      try {
        setInputTables(await datasourceService.getAll(activeProject.id));
      } catch (error: any) {
        message.error(error.response?.data?.message || 'Failed to load input tables');
      }
    };
    void loadInputTables();
  }, [activeProject?.id]);

  const updatePipeline = (changes: Partial<Pipeline>) => {
    setPipelines((current) =>
      current.map((item) => (item.id === activePipelineId ? { ...item, ...changes } : item)),
    );
  };

  const saveDraft = () => {
    if (!draftStorageKey || !activeProject) {
      message.error('Select a project before saving a pipeline draft');
      return;
    }

    try {
      const draft: StoredPipelineDrafts = {
        version: DRAFT_STORAGE_VERSION,
        activePipelineId,
        pipelines,
        savedAt: new Date().toISOString(),
      };
      localStorage.setItem(draftStorageKey, JSON.stringify(draft));
      message.success(`Pipeline draft saved locally for ${activeProject.name}`);
    } catch {
      message.error('Failed to save pipeline draft to local storage');
    }
  };

  const selectInputTable = (tableId: string) => {
    const table = inputTables.find((item) => item.id === tableId);
    if (!table) return;
    const directFields = (table.schema?.columns || []).map((column) => ({
      id: makeId(),
      name: column.name,
      type: column.type,
    }));
    updatePipeline({
      inputTableId: tableId,
      outputTableName: `${table.name}_output`,
      outputFields: directFields,
      directPassMappings: [],
      concatMappings: [],
    });
    setSelectedInputFieldName(undefined);
    setSelectedOutputFieldId(undefined);
    setSelectedRuleType(undefined);
  };

  const createPipeline = ({ name }: { name: string }) => {
    const created: Pipeline = {
      id: makeId(),
      name,
      outputTableName: 'output_table',
      outputFields: [],
      directPassMappings: [],
      concatMappings: [],
    };
    setPipelines((current) => [...current, created]);
    setActivePipelineId(created.id);
    pipelineForm.resetFields();
    setNewPipelineOpen(false);
  };

  const openAddField = () => {
    setEditingFieldId(undefined);
    fieldForm.resetFields();
    fieldForm.setFieldValue('type', 'string');
    setFieldModalOpen(true);
  };

  const openEditField = (field: OutputField) => {
    setEditingFieldId(field.id);
    fieldForm.setFieldsValue({ name: field.name, type: field.type });
    setFieldModalOpen(true);
  };

  const saveField = (values: FieldForm) => {
    const nextFields = editingFieldId
      ? pipeline.outputFields.map((field) =>
          field.id === editingFieldId ? { ...field, ...values } : field,
        )
      : [...pipeline.outputFields, { id: makeId(), ...values }];
    updatePipeline({ outputFields: nextFields });
    setFieldModalOpen(false);
    fieldForm.resetFields();
  };

  const removeField = (fieldId: string) => {
    updatePipeline({
      outputFields: pipeline.outputFields.filter((field) => field.id !== fieldId),
      directPassMappings: pipeline.directPassMappings.filter(
        (mapping) => mapping.outputFieldId !== fieldId,
      ),
      concatMappings: pipeline.concatMappings.filter(
        (mapping) => mapping.outputFieldId !== fieldId,
      ),
    });
    if (selectedOutputFieldId === fieldId) {
      setSelectedOutputFieldId(undefined);
      setSelectedRuleType(undefined);
    }
  };

  const switchPipeline = (pipelineId: string) => {
    setActivePipelineId(pipelineId);
    setSelectedInputFieldName(undefined);
    setSelectedOutputFieldId(undefined);
    setSelectedRuleType(undefined);
  };

  const reorderOutputFields = (targetFieldId: string) => {
    if (!draggedOutputFieldId || draggedOutputFieldId === targetFieldId) return;
    const fromIndex = pipeline.outputFields.findIndex((field) => field.id === draggedOutputFieldId);
    const toIndex = pipeline.outputFields.findIndex((field) => field.id === targetFieldId);
    if (fromIndex < 0 || toIndex < 0) return;

    const nextFields = [...pipeline.outputFields];
    const [movedField] = nextFields.splice(fromIndex, 1);
    nextFields.splice(toIndex, 0, movedField);
    updatePipeline({ outputFields: nextFields });
    setDraggedOutputFieldId(undefined);
  };

  const selectInputField = (fieldName: string) => {
    setSelectedInputFieldName(fieldName);
    setSelectedOutputFieldId(undefined);
    if (pipeline.directPassMappings.some((mapping) => mapping.inputFieldName === fieldName)) {
      setSelectedRuleType('DIRECT_PASS');
    } else if (pipeline.concatMappings.some((mapping) => mapping.anchorInputFieldName === fieldName)) {
      setSelectedRuleType('CONCAT');
    } else {
      setSelectedRuleType(undefined);
    }
  };

  const selectOutputField = (fieldId: string) => {
    setSelectedOutputFieldId(fieldId);
    setSelectedInputFieldName(undefined);
    if (pipeline.directPassMappings.some((mapping) => mapping.outputFieldId === fieldId)) {
      setSelectedRuleType('DIRECT_PASS');
    } else if (pipeline.concatMappings.some((mapping) => mapping.outputFieldId === fieldId)) {
      setSelectedRuleType('CONCAT');
    } else {
      setSelectedRuleType(undefined);
    }
  };

  const selectRuleType = (ruleType: string) => {
    if (!selectedInputFieldName && !selectedOutputFieldId) return;
    setSelectedRuleType(ruleType);

    if (ruleType === 'DIRECT_PASS') {
      updatePipeline({
        concatMappings: pipeline.concatMappings.filter(
          (mapping) =>
            selectedOutputFieldId
              ? mapping.outputFieldId !== selectedOutputFieldId
              : mapping.anchorInputFieldName !== selectedInputFieldName,
        ),
      });
    } else if (ruleType === 'CONCAT') {
      const existing = pipeline.concatMappings.find(
        (mapping) =>
          selectedOutputFieldId
            ? mapping.outputFieldId === selectedOutputFieldId
            : mapping.anchorInputFieldName === selectedInputFieldName,
      );
      updatePipeline({
        directPassMappings: pipeline.directPassMappings.filter(
          (mapping) =>
            selectedOutputFieldId
              ? mapping.outputFieldId !== selectedOutputFieldId
              : mapping.inputFieldName !== selectedInputFieldName,
        ),
        concatMappings: existing
          ? pipeline.concatMappings
          : [
              ...pipeline.concatMappings,
              {
                anchorInputFieldName: selectedInputFieldName || '',
                leftInputFieldName: selectedInputFieldName,
                separator: '',
                outputFieldId: selectedOutputFieldId,
              },
            ],
      });
    }
  };

  const setDirectPassOutput = (outputFieldId: string) => {
    if (!selectedInputFieldName) return;
    const displacedMapping = pipeline.directPassMappings.find(
      (mapping) =>
        mapping.outputFieldId === outputFieldId &&
        mapping.inputFieldName !== selectedInputFieldName,
    );
    updatePipeline({
      directPassMappings: [
        ...pipeline.directPassMappings.filter(
          (mapping) =>
            mapping.inputFieldName !== selectedInputFieldName &&
            mapping.outputFieldId !== outputFieldId,
        ),
        { inputFieldName: selectedInputFieldName, outputFieldId },
      ],
      concatMappings: pipeline.concatMappings.filter(
        (mapping) =>
          mapping.anchorInputFieldName !== selectedInputFieldName &&
          mapping.outputFieldId !== outputFieldId,
      ),
    });
    if (displacedMapping) {
      message.info(`Replaced direct pass from "${displacedMapping.inputFieldName}"`);
    }
  };

  const setDirectPassInput = (inputFieldName: string) => {
    if (!selectedOutputFieldId) return;
    const displacedMapping = pipeline.directPassMappings.find(
      (mapping) =>
        mapping.inputFieldName === inputFieldName &&
        mapping.outputFieldId !== selectedOutputFieldId,
    );
    updatePipeline({
      directPassMappings: [
        ...pipeline.directPassMappings.filter(
          (mapping) =>
            mapping.outputFieldId !== selectedOutputFieldId &&
            mapping.inputFieldName !== inputFieldName,
        ),
        { inputFieldName, outputFieldId: selectedOutputFieldId },
      ],
      concatMappings: pipeline.concatMappings.filter(
        (mapping) => mapping.outputFieldId !== selectedOutputFieldId,
      ),
    });
    if (displacedMapping) {
      message.info(`Replaced the previous direct pass from "${inputFieldName}"`);
    }
  };

  const updateConcatMapping = (changes: Partial<ConcatMapping>) => {
    if (!selectedInputFieldName && !selectedOutputFieldId) return;
    const existing = pipeline.concatMappings.find(
      (mapping) =>
        selectedOutputFieldId
          ? mapping.outputFieldId === selectedOutputFieldId
          : mapping.anchorInputFieldName === selectedInputFieldName,
    ) || {
      anchorInputFieldName: selectedInputFieldName || '',
      leftInputFieldName: selectedInputFieldName,
      separator: '',
      outputFieldId: selectedOutputFieldId,
    };
    const next = {
      ...existing,
      ...changes,
      anchorInputFieldName:
        existing.anchorInputFieldName ||
        selectedInputFieldName ||
        changes.leftInputFieldName ||
        changes.rightInputFieldName ||
        '',
      outputFieldId: selectedOutputFieldId || changes.outputFieldId || existing.outputFieldId,
    };
    const displacedDirect = changes.outputFieldId
      ? pipeline.directPassMappings.find((mapping) => mapping.outputFieldId === changes.outputFieldId)
      : undefined;
    const displacedConcat = changes.outputFieldId
      ? pipeline.concatMappings.find(
          (mapping) =>
            mapping.outputFieldId === changes.outputFieldId &&
            mapping.anchorInputFieldName !== selectedInputFieldName,
        )
      : undefined;

    updatePipeline({
      directPassMappings: pipeline.directPassMappings.filter(
        (mapping) => !changes.outputFieldId || mapping.outputFieldId !== changes.outputFieldId,
      ),
      concatMappings: [
        ...pipeline.concatMappings.filter(
          (mapping) =>
            (selectedOutputFieldId
              ? mapping.outputFieldId !== selectedOutputFieldId
              : mapping.anchorInputFieldName !== selectedInputFieldName) &&
            (!changes.outputFieldId || mapping.outputFieldId !== changes.outputFieldId),
        ),
        next,
      ],
    });

    if (displacedDirect || displacedConcat) {
      message.info('Replaced the previous transformation for this output field');
    }
  };

  const validConcatMappings = pipeline.concatMappings.filter(
    (mapping) =>
      mapping.outputFieldId &&
      (mapping.leftInputFieldName || mapping.rightInputFieldName),
  );
  const configuredOutputIds = new Set([
    ...pipeline.directPassMappings.map((mapping) => mapping.outputFieldId),
    ...validConcatMappings.map((mapping) => mapping.outputFieldId!),
  ]);

  const runPipeline = async () => {
    if (!activeProject || !selectedInput) {
      message.error('Select an input table before running the pipeline');
      return;
    }
    if (!pipeline.outputTableName.trim()) {
      message.error('Enter an output table name');
      return;
    }
    if (!pipeline.outputFields.length) {
      message.error('Add at least one output field');
      return;
    }
    if (configuredOutputIds.size !== pipeline.outputFields.length) {
      message.error('Every output field must have a transformation rule before running');
      return;
    }

    try {
      setRunning(true);
      const existingOutputs = await exportTableService.getAll(activeProject.id);
      const hasSameName = existingOutputs.some(
        (table) => table.name.trim() === pipeline.outputTableName.trim(),
      );
      let overwrite = false;
      if (hasSameName) {
        overwrite = await new Promise<boolean>((resolve) => {
          Modal.confirm({
            title: 'Output table already exists',
            content: `"${pipeline.outputTableName.trim()}" already exists in this project. Do you want to overwrite it?`,
            okText: 'Overwrite',
            okButtonProps: { danger: true },
            cancelText: 'Cancel',
            onOk: () => resolve(true),
            onCancel: () => resolve(false),
          });
        });
        if (!overwrite) {
          message.info('Pipeline run cancelled');
          return;
        }
      }

      const sourceRows = await datasourceService.getPreview(
        selectedInput.id,
        Math.max(selectedInput.rowCount || 0, 100),
      );
      const mappingByOutputId = new Map(
        pipeline.directPassMappings.map((mapping) => [mapping.outputFieldId, mapping.inputFieldName]),
      );
      const concatByOutputId = new Map(
        validConcatMappings.map((mapping) => [mapping.outputFieldId!, mapping]),
      );
      const transformedRows = sourceRows.map((sourceRow) =>
        pipeline.outputFields.reduce<Record<string, any>>((outputRow, outputField) => {
          const inputFieldName = mappingByOutputId.get(outputField.id);
          const concat = concatByOutputId.get(outputField.id);
          if (inputFieldName) {
            outputRow[outputField.name] = sourceRow[inputFieldName];
          } else if (concat) {
            const left = concat.leftInputFieldName
              ? sourceRow[concat.leftInputFieldName] ?? ''
              : '';
            const right = concat.rightInputFieldName
              ? sourceRow[concat.rightInputFieldName] ?? ''
              : '';
            outputRow[outputField.name] = `${left}${concat.separator}${right}`;
          } else {
            outputRow[outputField.name] = null;
          }
          return outputRow;
        }, {}),
      );

      await exportTableService.create({
        name: pipeline.outputTableName.trim(),
        format: 'csv',
        schema: pipeline.outputFields.map((field) => ({ name: field.name, type: field.type })),
        data: transformedRows,
        description: `Generated by pipeline: ${pipeline.name}`,
        projectId: activeProject.id,
        overwrite,
      });
      await refreshProjects(activeProject.id);
      message.success(`Pipeline completed: ${transformedRows.length} rows saved to output tables`);
    } catch (error: any) {
      message.error(error.response?.data?.message || error.message || 'Pipeline execution failed');
    } finally {
      setRunning(false);
    }
  };

  const canRun =
    Boolean(activeProject && selectedInput && pipeline.outputTableName.trim()) &&
    pipeline.outputFields.length > 0 &&
    configuredOutputIds.size === pipeline.outputFields.length;

  if (!pipeline) return null;

  return (
    <div className="workbench">
      <div className="workbench-topbar">
        <div className="pipeline-picker">
          <Text type="secondary">Pipeline</Text>
          <Select
            value={activePipelineId}
            options={pipelines.map((item) => ({ value: item.id, label: item.name }))}
            onChange={switchPipeline}
          />
          <Button icon={<PlusOutlined />} onClick={() => setNewPipelineOpen(true)}>
            New pipeline
          </Button>
        </div>
        <Space>
          <Tag color="blue">{activeProject?.name || 'No project selected'}</Tag>
          <Button icon={<SaveOutlined />} disabled={!activeProject} onClick={saveDraft}>
            Save draft
          </Button>
          <Button
            type="primary"
            icon={<ArrowRightOutlined />}
            loading={running}
            disabled={!canRun}
            onClick={runPipeline}
          >
            Run pipeline
          </Button>
        </Space>
      </div>

      <div className="workbench-heading">
        <div>
          <Title level={2}><ToolOutlined /> Transformation Workbench</Title>
          <Paragraph>Build a data pipeline from an input table to an output table.</Paragraph>
        </div>
        <div className="pipeline-summary">
          <span><strong>{inputFields.length}</strong> input fields</span>
          <ArrowRightOutlined />
          <span><strong>{pipeline.outputFields.length}</strong> output fields</span>
        </div>
      </div>

      <div className="pipeline-canvas">
        <Card
          className="pipeline-panel input-panel"
          title={<Space><DatabaseOutlined /> Input table</Space>}
        >
          <div className="panel-control">
            <Text type="secondary">Source</Text>
            <Select
              value={pipeline.inputTableId}
              placeholder={activeProject ? 'Select an input table' : 'Select a project first'}
              disabled={!activeProject}
              options={inputTables.map((table) => ({
                value: table.id,
                label: `${table.name} · ${table.rowCount || 0} rows`,
              }))}
              onChange={selectInputTable}
            />
          </div>

          {selectedInput ? (
            <>
              <div className="table-meta">
                <TableOutlined />
                <span>
                  <Text strong>{selectedInput.name}</Text>
                  <Text type="secondary">{selectedInput.rowCount || 0} rows · {inputFields.length} fields</Text>
                </span>
              </div>
              <div className="field-list">
                {inputFields.map((field, index) => {
                  const directMapping = pipeline.directPassMappings.find(
                    (item) => item.inputFieldName === field.name,
                  );
                  const concatMapping = pipeline.concatMappings.find(
                    (item) => item.anchorInputFieldName === field.name,
                  );
                  const usedByConcat = pipeline.concatMappings.some(
                    (item) =>
                      item.anchorInputFieldName !== field.name &&
                      (item.leftInputFieldName === field.name || item.rightInputFieldName === field.name),
                  );
                  return (
                  <div
                    className={`schema-field input-field ${selectedInputFieldName === field.name ? 'selected' : ''}`}
                    key={`${field.name}-${index}`}
                    onClick={() => selectInputField(field.name)}
                  >
                    <span className="field-index">{index + 1}</span>
                    <span className="field-copy">
                      <Text strong>{field.name}</Text>
                      <Text type="secondary">{field.type}</Text>
                    </span>
                    {directMapping && <Tag color="blue">Direct pass</Tag>}
                    {concatMapping && <Tag color="purple">Concat</Tag>}
                    {!concatMapping && usedByConcat && <Tag>Used</Tag>}
                    <span className="connection-dot" />
                  </div>
                  );
                })}
              </div>
            </>
          ) : (
            <Empty
              image={Empty.PRESENTED_IMAGE_SIMPLE}
              description={inputTables.length ? 'Choose an input table' : 'No input tables in this project'}
            />
          )}
        </Card>

        <Card
          className="pipeline-panel rules-panel"
          title={<Space><FunctionOutlined /> Transformation rules</Space>}
          extra={<Tag color="blue">{configuredOutputIds.size} configured</Tag>}
        >
          {selectedInputField || selectedOutputField ? (
            <div className="rules-preview">
              <div className="rule-editor">
                <div className="selected-field-heading">
                  <Text type="secondary">
                    Selected {selectedOutputField ? 'output' : 'input'} field
                  </Text>
                  <Title level={4}>{selectedOutputField?.name || selectedInputField?.name}</Title>
                  <Tag>{selectedOutputField?.type || selectedInputField?.type}</Tag>
                </div>

                <div className="rule-form">
                  <label>Transformation rule</label>
                  <Select
                    value={selectedRuleType}
                    placeholder="Select a transformation rule"
                    options={[
                      { value: 'DIRECT_PASS', label: 'Direct Pass' },
                      { value: 'CONCAT', label: 'Concat' },
                    ]}
                    onChange={selectRuleType}
                  />

                  {selectedRuleType === 'DIRECT_PASS' && (
                    <div className="direct-pass-editor">
                      <div className="mapping-field">
                        <Text type="secondary">Input field</Text>
                        {selectedOutputField ? (
                          <Select
                            value={selectedMapping?.inputFieldName}
                            placeholder="Select an input field"
                            options={inputFields.map((field) => ({
                              value: field.name,
                              label: `${field.name} · ${field.type}`,
                            }))}
                            onChange={setDirectPassInput}
                          />
                        ) : (
                          <Input value={selectedInputField?.name} readOnly />
                        )}
                      </div>
                      <ArrowRightOutlined className="mapping-arrow" />
                      <div className="mapping-field">
                        <Text type="secondary">Output field</Text>
                        {selectedOutputField ? (
                          <Input value={selectedOutputField.name} readOnly />
                        ) : (
                          <Select
                            value={selectedMapping?.outputFieldId}
                            placeholder="Select an output field"
                            options={pipeline.outputFields.map((field) => ({
                              value: field.id,
                              label: `${field.name} · ${field.type}`,
                            }))}
                            onChange={setDirectPassOutput}
                          />
                        )}
                      </div>
                    </div>
                  )}

                  {selectedRuleType === 'CONCAT' && (
                    <div className="concat-editor">
                      <div className="concat-parts">
                        <div className="mapping-field">
                          <Text type="secondary">Left field (optional)</Text>
                          <Select
                            allowClear
                            value={selectedConcatMapping?.leftInputFieldName}
                            placeholder="Leave blank"
                            options={inputFields.map((field) => ({
                              value: field.name,
                              label: `${field.name} · ${field.type}`,
                            }))}
                            onChange={(value) => updateConcatMapping({ leftInputFieldName: value })}
                          />
                        </div>
                        <div className="mapping-field separator-field">
                          <Text type="secondary">Separator</Text>
                          <Input
                            value={selectedConcatMapping?.separator || ''}
                            placeholder="-"
                            onChange={(event) => updateConcatMapping({ separator: event.target.value })}
                          />
                        </div>
                        <div className="mapping-field">
                          <Text type="secondary">Right field (optional)</Text>
                          <Select
                            allowClear
                            value={selectedConcatMapping?.rightInputFieldName}
                            placeholder="Leave blank"
                            options={inputFields.map((field) => ({
                              value: field.name,
                              label: `${field.name} · ${field.type}`,
                            }))}
                            onChange={(value) => updateConcatMapping({ rightInputFieldName: value })}
                          />
                        </div>
                      </div>
                      <div className="concat-output">
                        <ArrowRightOutlined />
                        <div className="mapping-field">
                          <Text type="secondary">Output field</Text>
                          {selectedOutputField ? (
                            <Input value={selectedOutputField.name} readOnly />
                          ) : (
                            <Select
                              value={selectedConcatMapping?.outputFieldId}
                              placeholder="Select an output field"
                              options={pipeline.outputFields.map((field) => ({
                                value: field.id,
                                label: `${field.name} · ${field.type}`,
                              }))}
                              onChange={(value) => updateConcatMapping({ outputFieldId: value })}
                            />
                          )}
                        </div>
                      </div>
                      {!selectedConcatMapping?.leftInputFieldName &&
                        !selectedConcatMapping?.rightInputFieldName && (
                          <Text type="danger">Select at least one input field.</Text>
                        )}
                    </div>
                  )}
                </div>
              </div>
              <div className="mapping-summary">
                <Text type="secondary">Pipeline mappings</Text>
                <div>
                  <Tag color="blue">{pipeline.directPassMappings.length} direct pass</Tag>
                  <Tag color="purple">{validConcatMappings.length} concat</Tag>
                  <Tag>{Math.max(pipeline.outputFields.length - configuredOutputIds.size, 0)} unconfigured</Tag>
                </div>
              </div>
            </div>
          ) : (
            <Empty
              image={Empty.PRESENTED_IMAGE_SIMPLE}
              description={selectedInput ? 'Click an input field to configure its transformation' : 'Select an input table to begin mapping'}
            />
          )}
        </Card>

        <Card
          className="pipeline-panel output-panel"
          title={<Space><TableOutlined /> Output table</Space>}
          extra={<Button type="text" icon={<PlusOutlined />} onClick={openAddField}>Add field</Button>}
        >
          <div className="panel-control">
            <Text type="secondary">Output table name</Text>
            <Input
              value={pipeline.outputTableName}
              placeholder="Output table name"
              onChange={(event) => updatePipeline({ outputTableName: event.target.value })}
            />
          </div>

          <div className="table-meta output-meta">
            <TableOutlined />
            <span>
              <Text strong>{pipeline.outputTableName || 'Unnamed output'}</Text>
              <Text type="secondary">{pipeline.outputFields.length} fields</Text>
            </span>
          </div>

          {pipeline.outputFields.length ? (
            <div className="field-list">
              {pipeline.outputFields.map((field, index) => {
                const directMapping = pipeline.directPassMappings.find(
                  (item) => item.outputFieldId === field.id,
                );
                const concatMapping = pipeline.concatMappings.find(
                  (item) => item.outputFieldId === field.id,
                );
                const mapping = directMapping || concatMapping;
                return (
                <div
                  className={`schema-field output-field ${mapping ? 'mapped' : ''} ${selectedOutputFieldId === field.id ? 'selected' : ''} ${draggedOutputFieldId === field.id ? 'dragging' : ''}`}
                  key={field.id}
                  onClick={() => selectOutputField(field.id)}
                  onDragOver={(event) => event.preventDefault()}
                  onDrop={(event) => {
                    event.preventDefault();
                    reorderOutputFields(field.id);
                  }}
                >
                  <span className="connection-dot" />
                  <span
                    className="field-drag-handle"
                    draggable
                    title="Drag to reorder"
                    onClick={(event) => event.stopPropagation()}
                    onDragStart={(event) => {
                      event.stopPropagation();
                      event.dataTransfer.effectAllowed = 'move';
                      event.dataTransfer.setData('text/plain', field.id);
                      setDraggedOutputFieldId(field.id);
                    }}
                    onDragEnd={() => setDraggedOutputFieldId(undefined)}
                  >
                    <HolderOutlined />
                  </span>
                  <span className="field-index">{index + 1}</span>
                  <span className="field-copy">
                    <Text strong>{field.name}</Text>
                    <Text type="secondary">{field.type}</Text>
                  </span>
                  {directMapping && <Tag color="green">{directMapping.inputFieldName}</Tag>}
                  {concatMapping && (
                    <Tag color="purple">
                      {concatMapping.leftInputFieldName || '∅'}
                      {concatMapping.separator}
                      {concatMapping.rightInputFieldName || '∅'}
                    </Tag>
                  )}
                  <Space size={2} className="field-actions">
                    <Tooltip title="Edit field">
                      <Button
                        type="text"
                        size="small"
                        icon={<EditOutlined />}
                        onClick={(event) => {
                          event.stopPropagation();
                          openEditField(field);
                        }}
                      />
                    </Tooltip>
                    <Popconfirm
                      title="Delete this output field?"
                      onConfirm={() => removeField(field.id)}
                    >
                      <Button
                        type="text"
                        danger
                        size="small"
                        icon={<DeleteOutlined />}
                        onClick={(event) => event.stopPropagation()}
                      />
                    </Popconfirm>
                  </Space>
                </div>
                );
              })}
            </div>
          ) : (
            <Empty image={Empty.PRESENTED_IMAGE_SIMPLE} description="Add output fields or select an input table" />
          )}
        </Card>
      </div>

      <Modal title="New pipeline" open={newPipelineOpen} footer={null} onCancel={() => setNewPipelineOpen(false)}>
        <Form form={pipelineForm} layout="vertical" onFinish={createPipeline}>
          <Form.Item name="name" label="Pipeline name" rules={[{ required: true, message: 'Enter a pipeline name' }]}>
            <Input autoFocus placeholder="e.g. Drug order transformation" />
          </Form.Item>
          <Button type="primary" htmlType="submit">Create pipeline</Button>
        </Form>
      </Modal>

      <Modal
        title={editingFieldId ? 'Edit output field' : 'Add output field'}
        open={fieldModalOpen}
        footer={null}
        onCancel={() => setFieldModalOpen(false)}
      >
        <Form form={fieldForm} layout="vertical" onFinish={saveField}>
          <Form.Item name="name" label="Field name" rules={[{ required: true, message: 'Enter a field name' }]}>
            <Input autoFocus placeholder="amount_with_unit" />
          </Form.Item>
          <Form.Item name="type" label="Data type" rules={[{ required: true }]}>
            <Select options={fieldTypes.map((type) => ({ value: type, label: type }))} />
          </Form.Item>
          <Button type="primary" htmlType="submit">{editingFieldId ? 'Save changes' : 'Add field'}</Button>
        </Form>
      </Modal>
    </div>
  );
};
