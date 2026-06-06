import { fireEvent, render, screen } from '@testing-library/react';
import { useState } from 'react';
import { describe, expect, it, vi } from 'vitest';
import { Modal } from './Modal';

function ModalHarness() {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <>
      <button type="button" onClick={() => setIsOpen(true)}>
        Open profile form
      </button>
      {isOpen && (
        <Modal title="Profile form" onClose={() => setIsOpen(false)}>
          <label htmlFor="profile-name">Name</label>
          <input id="profile-name" />
          <button type="button">Save profile</button>
        </Modal>
      )}
    </>
  );
}

describe('Modal', () => {
  it('renders dialog content through a portal', () => {
    const onClose = vi.fn();

    render(
      <Modal title="Portal dialog" onClose={onClose}>
        <p>Portal content</p>
      </Modal>
    );

    const dialog = screen.getByRole('dialog', { name: 'Portal dialog' });

    expect(document.body).toContainElement(dialog);
    expect(dialog).toHaveAttribute('aria-modal', 'true');
    expect(screen.getByText('Portal content')).toBeInTheDocument();
  });

  it('closes from the close button', () => {
    const onClose = vi.fn();

    render(
      <Modal title="Closable dialog" onClose={onClose}>
        <button type="button">Inner action</button>
      </Modal>
    );

    fireEvent.click(screen.getByRole('button', { name: 'Close modal' }));

    expect(onClose).toHaveBeenCalledTimes(1);
  });

  it('closes on Escape', () => {
    const onClose = vi.fn();

    render(
      <Modal title="Keyboard dialog" onClose={onClose}>
        <button type="button">Inner action</button>
      </Modal>
    );

    fireEvent.keyDown(screen.getByRole('dialog'), { key: 'Escape' });

    expect(onClose).toHaveBeenCalledTimes(1);
  });

  it('closes on outside click and ignores inside clicks', () => {
    const onClose = vi.fn();

    render(
      <Modal title="Outside dialog" onClose={onClose}>
        <button type="button">Inner action</button>
      </Modal>
    );

    fireEvent.mouseDown(screen.getByRole('dialog'));
    expect(onClose).not.toHaveBeenCalled();

    fireEvent.mouseDown(screen.getByTestId('modal-overlay'));
    expect(onClose).toHaveBeenCalledTimes(1);
  });

  it('focuses the first interactive control on open', () => {
    const onClose = vi.fn();

    render(
      <Modal title="Focus dialog" onClose={onClose}>
        <button type="button">Inner action</button>
      </Modal>
    );

    expect(screen.getByRole('button', { name: 'Close modal' })).toHaveFocus();
  });

  it('traps focus inside the dialog when tabbing forward and backward', () => {
    const onClose = vi.fn();

    render(
      <Modal title="Focus trap dialog" onClose={onClose}>
        <button type="button">Inner action</button>
      </Modal>
    );

    const closeButton = screen.getByRole('button', { name: 'Close modal' });
    const innerButton = screen.getByRole('button', { name: 'Inner action' });
    const dialog = screen.getByRole('dialog');

    closeButton.focus();
    fireEvent.keyDown(dialog, { key: 'Tab', shiftKey: true });
    expect(innerButton).toHaveFocus();

    fireEvent.keyDown(dialog, { key: 'Tab' });
    expect(closeButton).toHaveFocus();
  });

  it('returns focus to the opening control after close', () => {
    render(<ModalHarness />);

    const openButton = screen.getByRole('button', {
      name: 'Open profile form',
    });

    openButton.focus();
    fireEvent.click(openButton);
    fireEvent.click(screen.getByRole('button', { name: 'Close modal' }));

    expect(openButton).toHaveFocus();
  });
});
