import { useState, useEffect } from 'react';
import { Plus, Trash2, CheckCircle, Crown, Loader, LogOut, Lock, ArrowLeft } from 'lucide-react';
import { collection, doc, setDoc, deleteDoc, onSnapshot } from 'firebase/firestore';
import { db } from './firebase';
import './index.css';

const DAYS = [
  { id: 'mon', name: 'Thứ 2' },
  { id: 'tue', name: 'Thứ 3' },
  { id: 'wed', name: 'Thứ 4' },
  { id: 'thu', name: 'Thứ 5' },
  { id: 'fri', name: 'Thứ 6' },
  { id: 'sat', name: 'Thứ 7' },
  { id: 'sun', name: 'Chủ nhật' }
];

const COLORS = [
  { id: 'default', value: '#e2e8f0', label: 'Bình thường' },
  { id: 'red', value: '#ef4444', label: 'Gấp' },
  { id: 'yellow', value: '#eab308', label: 'Đang làm' },
  { id: 'green', value: '#22c55e', label: 'Hoàn thành' },
  { id: 'blue', value: '#3b82f6', label: 'Ý tưởng' }
];

const TASKS_COLLECTION = 'tasks';

function App() {
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);

  // Mock State
  const [user, setUser] = useState(null);
  const [isPro, setIsPro] = useState(false);
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [checkoutStep, setCheckoutStep] = useState(1);
  const [isPaying, setIsPaying] = useState(false);
  
  // Login Form State
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  // Real-time sync with Firestore
  useEffect(() => {
    if (!user) return; // Only load tasks if logged in
    
    setLoading(true);
    const unsubscribe = onSnapshot(collection(db, TASKS_COLLECTION), (snapshot) => {
      const tasksData = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      setTasks(tasksData);
      setLoading(false);
    }, (error) => {
      console.error('Firestore error:', error);
      setLoading(false);
    });

    return () => unsubscribe();
  }, [user]);

  const handleLogin = (e) => {
    e.preventDefault();
    if (email) {
      setUser({ email });
    }
  };

  const handleLogout = () => {
    setUser(null);
    setIsPro(false);
    setTasks([]);
  };

  const handlePayment = () => {
    setIsPaying(true);
    // Fake API call 2 seconds
    setTimeout(() => {
      setIsPaying(false);
      setIsPro(true);
      setShowPaymentModal(false);
      alert('Thanh toán thành công! Bạn đã được nâng cấp lên PRO.');
    }, 2000);
  };

  const addTask = async (dayId) => {
    if (!isPro && tasks.length >= 5) {
      setShowPaymentModal(true);
      return;
    }

    try {
      const newTask = {
        dayId,
        content: '',
        completed: false,
        color: 'default'
      };
      const taskId = Date.now().toString();
      await setDoc(doc(db, TASKS_COLLECTION, taskId), newTask);
    } catch (error) {
      console.error('Error adding task:', error);
    }
  };

  const updateTask = async (taskId, field, value) => {
    const task = tasks.find(t => t.id === taskId);
    if (task) {
      try {
        const { id, ...taskData } = task;
        await setDoc(doc(db, TASKS_COLLECTION, taskId), {
          ...taskData,
          [field]: value
        });
      } catch (error) {
        console.error('Error updating task:', error);
      }
    }
  };

  const deleteTask = async (taskId) => {
    try {
      await deleteDoc(doc(db, TASKS_COLLECTION, taskId));
    } catch (error) {
      console.error('Error deleting task:', error);
    }
  };

  // Render Login Screen if not logged in
  if (!user) {
    return (
      <div className="login-screen">
        <div className="login-card">
          <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '1rem' }}>
            <CheckCircle color="#4f46e5" size={48} />
          </div>
          <h1 className="login-title">Đăng nhập / Đăng ký</h1>
          <p className="login-desc">Quản lý công việc tuần hiệu quả hơn</p>
          
          <form onSubmit={handleLogin}>
            <input 
              type="email" 
              className="login-input" 
              placeholder="Email của bạn" 
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required 
            />
            <input 
              type="password" 
              className="login-input" 
              placeholder="Mật khẩu" 
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required 
            />
            <button type="submit" className="login-btn">Vào ứng dụng</button>
          </form>
          <div style={{ marginTop: '1rem', fontSize: '0.8rem', color: 'var(--text-muted)' }}>
            *Nhập email bất kỳ để test (Mockup)
          </div>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="app-container" style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '100vh' }}>
        <div style={{ textAlign: 'center', color: '#94a3b8' }}>
          <div style={{ fontSize: '1.2rem', marginBottom: '0.5rem' }}>⏳ Đang tải dữ liệu...</div>
          <div style={{ fontSize: '0.85rem' }}>Kết nối hệ thống</div>
        </div>
      </div>
    );
  }

  const totalTasks = tasks.length;
  const completedTasks = tasks.filter(t => t.completed).length;
  const uncompletedTasks = totalTasks - completedTasks;
  const progressPercent = totalTasks === 0 ? 0 : Math.round((completedTasks / totalTasks) * 100);

  return (
    <div className="app-container">
      {/* Header */}
      <div className="header-card">
        <div className="header-top">
          <div className="app-title">
            <CheckCircle className="text-primary" size={28} color="#4f46e5" />
            Weekly Task Planner
            {isPro && <span className="pro-badge"><Crown size={14} /> PRO</span>}
          </div>
          
          <div className="user-info">
            <div style={{ fontSize: '0.9rem', fontWeight: '500' }}>{user.email}</div>
            
            {!isPro && (
              <button className="upgrade-btn" onClick={() => setShowPaymentModal(true)}>
                <Crown size={16} /> Nâng cấp Pro
              </button>
            )}
            
            <button className="logout-btn" onClick={handleLogout} title="Đăng xuất">
              <LogOut size={16} />
            </button>
          </div>
        </div>

        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
          <div className="stats-container">
            <div className="stat-item">
              <span className="stat-label">Tổng</span>
              <span className="stat-value">
                {totalTasks}
                {!isPro && <span style={{fontSize: '0.8rem', color: 'var(--text-muted)', fontWeight: 'normal'}}> / 5</span>}
              </span>
            </div>
            <div className="stat-item">
              <span className="stat-label">Đã xong</span>
              <span className="stat-value completed">{completedTasks}</span>
            </div>
            <div className="stat-item">
              <span className="stat-label">Chưa xong</span>
              <span className="stat-value uncompleted">{uncompletedTasks}</span>
            </div>
          </div>

          <div className="progress-container" style={{ flexGrow: 1 }}>
            <div className="progress-track">
              <div className="progress-fill" style={{ width: `${progressPercent}%` }}></div>
            </div>
            <span className="progress-text">{progressPercent}%</span>
          </div>
        </div>
      </div>

      {/* Main Board */}
      <div className="board">
        {DAYS.map(day => {
          const dayTasks = tasks.filter(t => t.dayId === day.id);
          
          return (
            <div key={day.id} className="day-column">
              <div className="day-header">
                {day.name}
                <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                  {dayTasks.length}
                </span>
              </div>
              
              <div className="task-list">
                {dayTasks.map(task => (
                  <div 
                    key={task.id} 
                    className={`task-card ${task.completed ? 'completed' : ''}`}
                    style={{ borderLeftColor: COLORS.find(c => c.id === task.color)?.value || 'var(--color-default)' }}
                  >
                    <div className="task-header">
                      <input 
                        type="checkbox" 
                        className="task-checkbox"
                        checked={task.completed}
                        onChange={(e) => updateTask(task.id, 'completed', e.target.checked)}
                      />
                      <textarea
                        className="task-input"
                        value={task.content}
                        onChange={(e) => updateTask(task.id, 'content', e.target.value)}
                        placeholder="Nhập công việc..."
                        rows={2}
                      />
                    </div>
                    
                    <div className="task-footer">
                      <div className="color-picker">
                        {COLORS.map(color => (
                          <button
                            key={color.id}
                            className={`color-btn ${task.color === color.id ? 'active' : ''}`}
                            style={{ backgroundColor: color.value }}
                            title={color.label}
                            onClick={() => updateTask(task.id, 'color', color.id)}
                          />
                        ))}
                      </div>
                      
                      <button 
                        className="delete-btn"
                        onClick={() => deleteTask(task.id)}
                        title="Xóa công việc"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
              
              <button 
                className="add-task-btn"
                onClick={() => addTask(day.id)}
              >
                {!isPro && tasks.length >= 5 ? <Lock size={18} color="var(--color-red)" /> : <Plus size={18} />}
                {(!isPro && tasks.length >= 5) ? 'Đã đạt giới hạn' : 'Thêm task'}
              </button>
              <div style={{ height: '1rem' }}></div>
            </div>
          );
        })}
      </div>

      {/* Paywall Modal */}
      {showPaymentModal && (
        <div className="modal-overlay">
          <div className="paywall-modal">
            <button className="close-btn" onClick={() => {
              setShowPaymentModal(false);
              setCheckoutStep(1);
            }}>×</button>
            
            {checkoutStep === 1 ? (
              <>
                <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '1rem' }}>
                  <Crown color="#eab308" size={64} />
                </div>
                <h2 className="paywall-title">Nâng cấp lên gói PRO</h2>
                <p className="paywall-desc">
                  Bạn đã đạt giới hạn 5 công việc của bản Free. <br/>
                  Nâng cấp ngay để mở khóa toàn bộ tính năng!
                </p>
                
                <div className="pricing-card">
                  <div className="price-amount">149.000đ</div>
                  <div className="price-period">/ tháng</div>
                  
                  <ul className="feature-list">
                    <li>✅ Tạo công việc không giới hạn</li>
                    <li>✅ Tùy chỉnh màu sắc nâng cao</li>
                    <li>✅ Đồng bộ dữ liệu real-time</li>
                    <li>✅ Hỗ trợ ưu tiên 24/7</li>
                  </ul>
                </div>

                <button 
                  className="pay-btn" 
                  onClick={() => setCheckoutStep(2)}
                >
                  Thanh toán ngay bằng QR
                </button>
              </>
            ) : (
              <>
                <button className="back-btn" onClick={() => setCheckoutStep(1)}>
                  <ArrowLeft size={16} /> Quay lại
                </button>
                <h2 className="paywall-title" style={{ fontSize: '1.5rem' }}>Quét mã để thanh toán</h2>
                
                <div className="payment-methods">
                  <div className="payment-method-card">
                    <h3>MoMo</h3>
                    <div className="qr-image-container">
                      <img src="https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=2|99|0919006030|Chu%20manh%20tung||0|0|149000|Nang%20cap%20Pro|transfer_myqr" alt="MoMo QR" />
                    </div>
                    <div className="transfer-info">
                      <p>SĐT: <strong>0919006030</strong></p>
                      <p>Tên: <strong>Chu mạnh tùng</strong></p>
                    </div>
                  </div>

                  <div className="payment-method-card">
                    <h3>Ngân hàng ACB</h3>
                    <div className="qr-image-container">
                      <img src="https://img.vietqr.io/image/acb-22418207-compact2.png?amount=149000&addInfo=Nang%20cap%20Pro&accountName=CHU%20MANH%20TUNG" alt="ACB QR" />
                    </div>
                    <div className="transfer-info">
                      <p>STK: <strong>22418207</strong></p>
                      <p>Tên: <strong>CHU MẠNH TÙNG</strong></p>
                    </div>
                  </div>
                </div>

                <button 
                  className="pay-btn" 
                  onClick={handlePayment}
                  disabled={isPaying}
                  style={{ background: '#22c55e' }}
                >
                  {isPaying ? <><Loader size={20} /> Đang kiểm tra giao dịch...</> : 'Tôi đã chuyển khoản thành công'}
                </button>
              </>
            )}
            
            <div style={{ marginTop: '1rem', fontSize: '0.8rem', color: 'var(--text-muted)' }}>
              *Đây là màn hình mô phỏng luồng thanh toán.
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default App;
