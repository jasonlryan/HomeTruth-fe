import { fireEvent, render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';
import PartnerEvidencePanel from './PartnerEvidencePanel';
import { getPartnerEvidence, getPartnerEvidenceDefinitions } from '../api/api';
jest.mock('../api/api', () => ({ getPartnerEvidence: jest.fn(), getPartnerEvidenceDefinitions: jest.fn(), exportPartnerEvidence: jest.fn() }));
const entry = { programme: { id: 3 }, capabilities: ['report:view', 'report:export'] };
const definitions = { minimumParticipants: 10, minimumCell: 5, denominator: 'Current consent required', interpretation: 'Recorded engagement', metrics: [{ key: 'activation', label: 'Activation', definition: 'Recorded signup', sources: ['signup_completed'], coverage: 'instrumented', unit: 'participants' }] };
beforeEach(() => { jest.clearAllMocks(); getPartnerEvidenceDefinitions.mockResolvedValue(definitions); });
test('shows protected cells without turning null into zero', async () => {
  getPartnerEvidence.mockResolvedValue({ state: 'available', month: '2026-09', generatedAt: '2026-10-25T00:00:00Z', partitions: [{ campaign: { id: 5, name: 'Autumn campaign' }, state: 'available', eligibleParticipants: 10, metrics: [{ key: 'activation', state: 'suppressed', count: null, rate: null }] }] });
  render(<PartnerEvidencePanel entry={entry} />);
  fireEvent.click(screen.getByRole('button', { name: 'Load evidence' }));
  expect(await screen.findByText('Protected')).toBeInTheDocument();
  expect(screen.queryByText('0 · 0%')).not.toBeInTheDocument();
  expect(screen.getByRole('button', { name: 'Download review pack' })).toBeInTheDocument();
});
test('clears old evidence when filters change or access is denied', async () => {
  getPartnerEvidence.mockResolvedValueOnce({ state: 'available', month: '2026-09', generatedAt: '2026-10-25T00:00:00Z', partitions: [{ campaign: { id: 5, name: 'Hidden group' }, state: 'suppressed', metrics: [] }] }).mockRejectedValueOnce({ response: { data: { message: 'Access denied' } } });
  render(<PartnerEvidencePanel entry={entry} />);
  fireEvent.click(screen.getByRole('button', { name: 'Load evidence' }));
  expect(await screen.findByText(/Evidence is suppressed/)).toBeInTheDocument();
  fireEvent.change(screen.getByLabelText('Calendar month'), { target: { value: '2026-08' } });
  expect(screen.queryByRole('heading', { name: 'Hidden group' })).not.toBeInTheDocument();
  fireEvent.click(screen.getByRole('button', { name: 'Load evidence' }));
  expect(await screen.findByRole('alert')).toHaveTextContent('Access denied');
  expect(screen.queryByRole('button', { name: 'Download review pack' })).not.toBeInTheDocument();
});
test('keeps approval-required reports empty and limits privacy auditors to definitions', async () => {
  getPartnerEvidence.mockResolvedValue({ state: 'approval_required', partitions: [] });
  const { unmount } = render(<PartnerEvidencePanel entry={entry} />);
  fireEvent.click(screen.getByRole('button', { name: 'Load evidence' }));
  expect(await screen.findByRole('status')).toHaveTextContent('awaits product and privacy approval');
  unmount(); render(<PartnerEvidencePanel entry={{ programme: { id: 3 }, capabilities: ['report:definitions:view'] }} />);
  expect(await screen.findByText('Metric definitions and coverage')).toBeInTheDocument();
  expect(screen.queryByRole('button', { name: 'Load evidence' })).not.toBeInTheDocument();
});
