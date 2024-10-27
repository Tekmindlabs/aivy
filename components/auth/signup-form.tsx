import { FormEventHandler } from 'react';

interface SignUpFormProps {
  onSubmit: FormEventHandler<HTMLFormElement>;
}

export default function SignUpForm({ onSubmit }: SignUpFormProps) {
  return (
    <form onSubmit={onSubmit}>
      <div>
        <label htmlFor="username">Username:</label>
        <input type="text" id="username" name="username" required />
      </div>
      <div>
        <label htmlFor="email">Email:</label>
        <input type="email" id="email" name="email" required />
      </div>
      <div>
        <label htmlFor="password">Password:</label>
        <input type="password" id="password" name="password" required />
      </div>
      <button type="submit">Sign Up</button>
    </form>
  );
}
