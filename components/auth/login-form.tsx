import { FormEventHandler } from 'react';

interface LoginFormProps {
  onSubmit: FormEventHandler<HTMLFormElement>;
}

export default function LoginForm({ onSubmit }: LoginFormProps) {
  return (
    <form onSubmit={onSubmit}>
      <div>
        <label htmlFor="email">Email:</label>
        <input type="email" id="email" name="email" />
      </div>
      <div>
        <label htmlFor="password">Password:</label>
        <input type="password" id="password" name="password" />
      </div>
      <button type="submit">Login</button>
    </form>
  );
}
