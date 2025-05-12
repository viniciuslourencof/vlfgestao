import { LoginForm } from "../components/login-form";

export function LoginPage() {
  return (
    <div className="min-h-screen flex justify-center items-center bg-gray-100">
      <div className="bg-white p-8 rounded-md shadow-lg w-full sm:w-96">
        <h2 className="text-2xl font-bold text-center mb-6">Login</h2>
        <LoginForm />
      </div>
    </div>
  );
}
