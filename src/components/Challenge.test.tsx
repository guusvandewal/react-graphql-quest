import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, it, expect } from 'vitest';
import { Challenge } from '@/components/Challenge';

const props = {
  question: 'What is 2 + 2?',
  options: ['3', '4', '5', '6'],
  correctIndex: 1,
  explanation: 'Two plus two equals four.',
};

describe('Challenge', () => {
  it('renders the question and all options', () => {
    render(<Challenge {...props} />);

    expect(screen.getByText('What is 2 + 2?')).toBeInTheDocument();
    props.options.forEach(opt =>
      expect(screen.getByRole('button', { name: opt })).toBeInTheDocument()
    );
  });

  it('shows correct feedback when the right answer is picked', async () => {
    const user = userEvent.setup();
    render(<Challenge {...props} />);

    await user.click(screen.getByRole('button', { name: '4' }));

    expect(screen.getByText(/Correct!/)).toBeInTheDocument();
    expect(screen.getByText('Two plus two equals four.')).toBeInTheDocument();
  });

  it('shows incorrect feedback when a wrong answer is picked', async () => {
    const user = userEvent.setup();
    render(<Challenge {...props} />);

    await user.click(screen.getByRole('button', { name: '3' }));

    expect(screen.getByText(/Not quite\./)).toBeInTheDocument();
    expect(screen.getByText('Two plus two equals four.')).toBeInTheDocument();
  });

  it('disables all option buttons after answering', async () => {
    const user = userEvent.setup();
    render(<Challenge {...props} />);

    await user.click(screen.getByRole('button', { name: '3' }));

    props.options.forEach(opt => expect(screen.getByRole('button', { name: opt })).toBeDisabled());
  });

  it('ignores subsequent clicks after an answer is picked', async () => {
    const user = userEvent.setup();
    render(<Challenge {...props} />);

    await user.click(screen.getByRole('button', { name: '3' })); // wrong
    await user.click(screen.getByRole('button', { name: '4' })); // correct — disabled, should no-op

    expect(screen.getByText(/Not quite\./)).toBeInTheDocument();
  });

  it('resets to unanswered state when "Try again" is clicked', async () => {
    const user = userEvent.setup();
    render(<Challenge {...props} />);

    await user.click(screen.getByRole('button', { name: '4' }));
    expect(screen.getByText(/Correct!/)).toBeInTheDocument();

    await user.click(screen.getByRole('button', { name: /try again/i }));

    expect(screen.queryByText(/Correct!/)).not.toBeInTheDocument();
    expect(screen.queryByRole('button', { name: /try again/i })).not.toBeInTheDocument();
    props.options.forEach(opt =>
      expect(screen.getByRole('button', { name: opt })).not.toBeDisabled()
    );
  });

  it('does not show feedback before any answer is picked', () => {
    render(<Challenge {...props} />);

    expect(screen.queryByText(/Correct!/)).not.toBeInTheDocument();
    expect(screen.queryByText(/Not quite\./)).not.toBeInTheDocument();
    expect(screen.queryByRole('button', { name: /try again/i })).not.toBeInTheDocument();
  });
});
