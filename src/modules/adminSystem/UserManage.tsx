import React, { useEffect, useState } from 'react';
import styles from './UserManage.module.css';

interface User {
  id: string;
  username: string;
  role: 'user' | 'developer';
}

const UserManage: React.FC = () => {
  const [users, setUsers] = useState<User[]>([
    { id: '1', username: 'admin', role: 'developer' },
    { id: '2', username: 'user1', role: 'user' },
  ]);
  const [loading, setLoading] = useState(false);

  const handleEditUser = (userId: string) => {
    alert(`编辑用户：${userId}`);
  };

  const handleDeleteUser = (userId: string) => {
    if (confirm('确定要删除这个用户吗？')) {
      setUsers((prev) => prev.filter((u) => u.id !== userId));
    }
  };

  return (
    <div className={styles.userManage}>
      <h2 className={styles.listTitle}>用户管理</h2>
      
      {loading ? (
        <div className={styles.loading}>加载中...</div>
      ) : (
        <table className={styles.userTable}>
          <thead className={styles.tableHeader}>
            <tr className={styles.tableRow}>
              <th className={styles.tableCell}>用户名</th>
              <th className={styles.tableCell}>角色</th>
              <th className={styles.tableCell}>操作</th>
            </tr>
          </thead>
          <tbody>
            {users.map((user) => (
              <tr key={user.id} className={styles.tableRow}>
                <td className={styles.tableCell}>{user.username}</td>
                <td className={styles.tableCell}>
                  <span className={`${styles.roleBadge} ${styles[user.role]}`}>
                    {user.role === 'developer' ? '开发者' : '普通用户'}
                  </span>
                </td>
                <td className={styles.tableCell}>
                  <button
                    className={`${styles.actionButton} ${styles.editButton}`}
                    onClick={() => handleEditUser(user.id)}
                  >
                    编辑
                  </button>
                  <button
                    className={`${styles.actionButton} ${styles.deleteButton}`}
                    onClick={() => handleDeleteUser(user.id)}
                  >
                    删除
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
};

export default UserManage;
