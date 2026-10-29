import { render, screen, fireEvent } from '@testing-library/react';
import IdentificationCandidates from './IdentificationCandidates';
test('reimporting a model offers its existing record and requires explicit separate-unit choice', () => {
  const onExisting = jest.fn(),
    onChoose = jest.fn();
  render(<IdentificationCandidates candidates={[{
    name: 'Washer',
    brand: 'Bosch',
    model: 'W100',
    quote: 'Bosch W100'
  }]} items={[{
    id: 7,
    record: {
      name: 'Kitchen washer',
      identity: {
        brand: 'bosch',
        model: 'w100'
      }
    }
  }]} onExisting={onExisting} onChoose={onChoose} />);
  fireEvent.click(screen.getByRole('button', {
    name: 'Open existing Kitchen washer'
  }));
  expect(onExisting).toHaveBeenCalledWith(7);
  expect(onChoose).not.toHaveBeenCalled();
  expect(screen.getByRole('button', {
    name: 'Add another physical item'
  })).toBeInTheDocument();
});
