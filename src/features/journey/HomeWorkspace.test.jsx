import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import HomeWorkspace from './HomeWorkspace';
import { getPropertyRecords, getPropertyTasks, getHomeItems, getHomeItem, getItemAnswers } from '../../api/api';
import { readJourney, writeJourney } from './context';
jest.mock('../../api/api', () => ({ getPropertyRecords: jest.fn(), getPropertyTasks: jest.fn(), getHomeItems: jest.fn(), getHomeItem: jest.fn(), getItemAnswers: jest.fn().mockResolvedValue([]) }));
jest.mock('../../context/AuthContext', () => ({ useAuth: () => ({ user: { id: 1 } }) }));
const homes = [42, 43].map(id => ({ property: { id }, currentAddress: { addressLine1: `Home ${id}` }, relationship: { relationshipType: 'owner', permissionLevel: 'admin' } }));
function workspace(path = '/my-home') { return render(<MemoryRouter initialEntries={[path]}><Routes><Route path="/my-home" element={<HomeWorkspace />} /><Route path="/my-home/:section" element={<HomeWorkspace />} /><Route path="/settings/connections" element={<HomeWorkspace settings="connections" />} /><Route path="/settings/agents" element={<HomeWorkspace settings="agents" />} /><Route path="/documents" element={<h1>Existing documents service</h1>} /><Route path="/ask-ai" element={<h1>Existing AskAI</h1>} /></Routes></MemoryRouter>); }
beforeEach(() => { sessionStorage.clear(); jest.clearAllMocks(); getPropertyRecords.mockResolvedValue(homes); getPropertyTasks.mockResolvedValue([]); getHomeItems.mockResolvedValue([]);getItemAnswers.mockResolvedValue([]); });
test('hub retains every agreed category and settings, not an appliance form', async () => {
  workspace(); await waitFor(() => expect(screen.getByLabelText('Selected home')).toHaveValue('42'));
  for (const label of ['Home details', 'Appliances, devices and systems', 'Connected devices', 'Documents and records', 'Maintenance and repairs', 'Costs and value', 'Home performance', 'AskAI', 'Connections', 'Agents']) expect(screen.getByRole('link', { name: label, exact: true })).toBeInTheDocument();
  expect(screen.queryByLabelText(/model number/i)).not.toBeInTheDocument();
});
test('connected equipment and Home performance have distinct click-throughs and hub returns', async () => {
  workspace(); await screen.findByText('Your home, easier to keep track of.');
  fireEvent.click(screen.getByRole('link', { name: 'Connected devices', exact: true }));
  expect(screen.getByRole('heading', { name: 'Connected devices.' })).toBeInTheDocument();
  expect(screen.getByText('No device integration is available here yet.')).toBeInTheDocument();
  fireEvent.click(screen.getByRole('link', { name: 'Home performance', exact: true }));
  expect(screen.getByRole('heading', { name: 'Home performance.' })).toBeInTheDocument();
  fireEvent.click(screen.getByRole('link', { name: 'Home overview', exact: true }));
  expect(screen.getByRole('heading', { name: 'Your home, easier to keep track of.' })).toBeInTheDocument();
});
test('selecting another home clears question context and requests only that home’s tasks', async () => {
  writeJourney('1', { intent: 'manage', propertyId: 42, question: 'Private question', returnTo: '/my-home' });
  workspace('/my-home/maintenance'); await waitFor(() => expect(getPropertyTasks).toHaveBeenCalledWith(42));
  fireEvent.change(screen.getByLabelText('Selected home'), { target: { value: '43' } });
  await waitFor(() => expect(getPropertyTasks).toHaveBeenCalledWith(43));
  expect(readJourney('1')).toMatchObject({ propertyId: 43, question: '' });
});
test('failed property load leaves useful general advice and a retry', async () => {
  getPropertyRecords.mockRejectedValue(new Error('offline')); workspace();
  expect(await screen.findByRole('alert')).toHaveTextContent('could not be loaded');
  expect(screen.getByRole('button', { name: 'Retry' })).toBeInTheDocument();
  fireEvent.click(screen.getByRole('link', { name: 'AskAI', exact: true }));
  expect(screen.getByRole('heading', { name: 'Existing AskAI' })).toBeInTheDocument();
});

test('optional agent settings do not change a buyer’s goal or selected home', async () => {
  writeJourney('1',{intent:'buy',propertyId:42,returnTo:'/buying'});
  workspace('/settings/agents');
  await waitFor(()=>expect(screen.getByLabelText('Selected home')).toHaveValue('42'));
  expect(readJourney('1')).toMatchObject({intent:'buy',propertyId:42});
});

test('switching homes clears the previous item URL and opens the new home inventory',async()=>{
 getHomeItem.mockResolvedValue({id:7,propertyId:42,version:1,record:{name:'Old home washer',identity:{},purchase:{},warranty:{},values:{},history:[]},evidence:[]});
 workspace('/my-home/items?item=7&home=42');await screen.findByRole('heading',{name:'Old home washer'});
 fireEvent.change(screen.getByLabelText('Selected home'),{target:{value:'43'}});
 await waitFor(()=>expect(getHomeItems).toHaveBeenCalledWith(43));expect(getHomeItem).not.toHaveBeenCalledWith(43,7);expect(screen.queryByRole('heading',{name:'Old home washer'})).not.toBeInTheDocument();
});
