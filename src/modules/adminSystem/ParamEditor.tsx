import React, { useEffect, useState } from 'react';
import { systemService } from '@services/systemService';
import styles from './ParamEditor.module.css';

const ParamEditor: React.FC = () => {
  const [params, setParams] = useState<Record<string, any>>({});
  const [newKey, setNewKey] = useState('');
  const [newValue, setNewValue] = useState('');

  useEffect(() => {
    loadParams();
  }, []);

  const loadParams = async () => {
    try {
      const data = await systemService.getParams();
      setParams(data);
    } catch (error) {
      console.error('Failed to load params:', error);
    }
  };

  const handleUpdateParam = async (key: string, value: any) => {
    try {
      await systemService.setParam(key, value);
      setParams((prev) => ({ ...prev, [key]: value }));
    } catch (error) {
      console.error('Failed to update param:', error);
    }
  };

  const handleAddParam = async () => {
    if (!newKey.trim()) return;
    
    try {
      await systemService.setParam(newKey, newValue);
      setParams((prev) => ({ ...prev, [newKey]: newValue }));
      setNewKey('');
      setNewValue('');
    } catch (error) {
      console.error('Failed to add param:', error);
    }
  };

  return (
    <div className={styles.paramEditor}>
      <h2 className={styles.listTitle}>系统参数编辑</h2>
      
      <div className={styles.addParamSection}>
        <h3 className={styles.sectionTitle}>添加新参数</h3>
        <div className={styles.inputGroup}>
          <input
            type="text"
            className={styles.input}
            placeholder="参数名"
            value={newKey}
            onChange={(e) => setNewKey(e.target.value)}
          />
          <input
            type="text"
            className={styles.input}
            placeholder="参数值"
            value={newValue}
            onChange={(e) => setNewValue(e.target.value)}
          />
          <button
            className={styles.addButton}
            onClick={handleAddParam}
          >
            添加
          </button>
        </div>
      </div>

      <div className={styles.paramsList}>
        <h3 className={styles.listTitle}>参数列表</h3>
        <table className={styles.table}>
          <thead className={styles.tableHeader}>
            <tr className={styles.tableRow}>
              <th className={styles.tableCell}>参数名</th>
              <th className={styles.tableCell}>参数值</th>
              <th className={styles.tableCell}>操作</th>
            </tr>
          </thead>
          <tbody>
            {Object.entries(params).map(([key, value]) => (
              <tr key={key} className={styles.tableRow}>
                <td className={styles.tableCell}>{key}</td>
                <td className={styles.tableCell}>{String(value)}</td>
                <td className={styles.tableCell}>
                  <button
                    className={styles.editButton}
                    onClick={() => handleUpdateParam(key, prompt('修改参数值:', String(value)) || value)}
                  >
                    编辑
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default ParamEditor;
