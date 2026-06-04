import { useEffect, useState } from 'react';
import { systemService } from '../../services/systemService';
import styles from './ParamEditor.module.css';

interface Param {
  id: string;
  name: string;
  value: string;
  description: string;
}

const ParamEditor: React.FC = () => {
  const [params, setParams] = useState<Param[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadParams();
  }, []);

  const loadParams = async () => {
    try {
      const data = await systemService.getParams();
      setParams(data);
    } catch (error) {
      console.error('加载参数失败:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <div className={styles.loading}>加载中...</div>;
  }

  return (
    <div className={styles.paramEditor}>
      <h2 className={styles.listTitle}>参数编辑</h2>
      <table className={styles.table}>
        <thead className={styles.tableHeader}>
          <tr className={styles.tableRow}>
            <th className={styles.tableCell}>参数名</th>
            <th className={styles.tableCell}>值</th>
            <th className={styles.tableCell}>描述</th>
            <th className={styles.tableCell}>操作</th>
          </tr>
        </thead>
        <tbody>
          {params.map((param) => (
            <tr key={param.id} className={styles.tableRow}>
              <td className={styles.tableCell}>{param.name}</td>
              <td className={styles.tableCell}>{param.value}</td>
              <td className={styles.tableCell}>{param.description}</td>
              <td className={styles.tableCell}>
                <button className={styles.editButton}>编辑</button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default ParamEditor;
