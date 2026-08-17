import LoginForm from './LoginForm'

export default function LoginPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 p-4">
      <div className="bg-white p-8 rounded-xl shadow-md w-full max-w-sm">
        <div className="text-center mb-6">
          <h1 className="text-2xl font-bold text-gray-900">🏸 Goodminton</h1>
          <p className="text-gray-500 text-sm mt-1">Quản lý CLB Cầu lông</p>
        </div>
        <LoginForm />
      </div>
    </div>
  )
}
