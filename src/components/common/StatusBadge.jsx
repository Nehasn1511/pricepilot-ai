import { Tag } from 'antd';

// Add new statuses here — change takes effect everywhere automatically
const STATUS_CONFIG = {
  PENDING:   { color: 'gold',    label: 'Pending'   },
  APPROVED:  { color: 'green',   label: 'Approved'  },
  REJECTED:  { color: 'red',     label: 'Rejected'  },
  EXPIRED:   { color: 'default', label: 'Expired'   },
  ACTIVE:    { color: 'blue',    label: 'Active'    },
  INACTIVE:  { color: 'default', label: 'Inactive'  },
  DRAFT:     { color: 'purple',  label: 'Draft'     },
};

const StatusBadge = ({ status }) => {
  const cfg = STATUS_CONFIG[status] || { color: 'default', label: status };
  return <Tag color={cfg.color} style={{ borderRadius: 4, fontWeight: 500 }}>{cfg.label}</Tag>;
};

export default StatusBadge;