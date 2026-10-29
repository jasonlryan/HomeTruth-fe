import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import ItemWorkspace from './ItemWorkspace';
import * as api from '../../api/api';
jest.mock('../../api/api',()=>({ getHomeItems:jest.fn(),getHomeItem:jest.fn(),createHomeItem:jest.fn(),updateHomeItem:jest.fn(),getUserDocuments:jest.fn(),identifyHomeItem:jest.fn(),attachItemEvidence:jest.fn(),detachItemEvidence:jest.fn(),findItemManual:jest.fn(),askItemAI:jest.fn(),uploadDocument:jest.fn() }));
const record={name:'Kitchen washer',category:'appliance',identity:{brand:'Example',model:'W100',method:'manual'},purchase:{price:{amount:500,currency:'GBP',date:'2026-10-29',source:'Receipt'}},warranty:{},values:{current:{amount:250,currency:'GBP',date:'2026-10-29',source:'User estimate'},replacement:{amount:600,currency:'GBP',date:'2026-10-29',source:'Quote'}},history:[]};
const item={id:7,propertyId:42,version:1,record,evidence:[{id:9,documentId:5,name:'Washer manual',role:'manual',matchStatus:'user_confirmed',hasText:true}]};
const show=(path='/my-home/items',props={})=>render(<MemoryRouter initialEntries={[path]}><ItemWorkspace homeId={42} homeLabel="Test home" canManage askGeneral={jest.fn()} rememberItem={jest.fn()} {...props} /></MemoryRouter>);
beforeEach(()=>{Object.defineProperty(global,'crypto',{value:{randomUUID:()=> 'e99d6b94-a656-4591-b78f-cdeab470c315'},configurable:true});jest.clearAllMocks();api.getHomeItems.mockResolvedValue([]);api.getHomeItem.mockResolvedValue(item);api.getUserDocuments.mockResolvedValue({data:{documents:[]}});});
test('starts with identification sources, manual model entry is a fallback',async()=>{
 show();fireEvent.click(await screen.findByRole('button',{name:'Add an item'}));
 expect(screen.getByLabelText('Photograph the rating label')).toBeInTheDocument();
 expect(screen.queryByLabelText('Full model or variant')).not.toBeInTheDocument();
 expect(screen.getByRole('button',{name:'QR or barcode'})).toBeInTheDocument();
 fireEvent.click(screen.getByRole('button',{name:'I can’t identify it — enter what I know'}));
 fireEvent.change(screen.getByLabelText('Name for this item'),{target:{value:'Boiler'}});
 api.createHomeItem.mockResolvedValue({id:7});
 fireEvent.click(screen.getByRole('button',{name:'Confirm and save item'}));
 await waitFor(()=>expect(api.createHomeItem).toHaveBeenCalledWith(42,expect.objectContaining({record:expect.objectContaining({name:'Boiler',identity:expect.objectContaining({method:'manual'})})})));
});
test('selected receipt identification proposes a match before saving',async()=>{
 api.identifyHomeItem.mockResolvedValue({candidates:[{name:'Washer',brand:'Example',model:'W100',quote:'Example W100',method:'text'}]});
 show();fireEvent.click(await screen.findByRole('button',{name:'Add an item'}));
 fireEvent.click(screen.getByRole('button',{name:'Receipt, email or warranty text'}));
 fireEvent.change(screen.getByLabelText('Paste the relevant receipt, email or warranty text'),{target:{value:'Example W100'}});
 fireEvent.click(screen.getByRole('button',{name:'Find my item'}));
 fireEvent.click(await screen.findByRole('button',{name:'Review and confirm this item'}));
 expect(screen.getByLabelText('Full model or variant')).toHaveValue('W100');expect(api.createHomeItem).not.toHaveBeenCalled();
});
test('shows distinct values and sends only explicitly selected evidence',async()=>{
 api.askItemAI.mockResolvedValue({statements:[{answer:'Use A',quote:'programme A',sourceId:9}]});show('/my-home/items?item=7&home=42');
 expect(await screen.findByText('Purchase price: GBP 500 · 2026-10-29 · Receipt')).toBeInTheDocument();
 expect(screen.getByText('Estimated current value: GBP 250 · 2026-10-29 · User estimate')).toBeInTheDocument();
 expect(screen.getByText('Replacement cost estimate: GBP 600 · 2026-10-29 · Quote')).toBeInTheDocument();
 expect(screen.getByRole('button',{name:'Send question'})).toBeDisabled();
 fireEvent.click(screen.getByLabelText('Washer manual'));fireEvent.change(screen.getByLabelText('Your question'),{target:{value:'Which programme?'}});fireEvent.click(screen.getByRole('button',{name:'Send question'}));
 await waitFor(()=>expect(api.askItemAI).toHaveBeenCalledWith(42,7,{question:'Which programme?',evidenceIds:[9]}));expect(await screen.findByText('programme A')).toBeInTheDocument();
});
test('load failure does not masquerade as an empty working inventory',async()=>{
 api.getHomeItems.mockRejectedValue(new Error('offline'));show();expect(await screen.findByRole('alert')).toBeInTheDocument();expect(screen.queryByText('Your first item is a useful place to start.')).not.toBeInTheDocument();
});
test('read-only home access does not expose record-changing actions',async()=>{
 show('/my-home/items?item=7&home=42',{canManage:false});await screen.findByRole('heading',{name:'Kitchen washer'});expect(screen.queryByRole('button',{name:'Edit item details'})).not.toBeInTheDocument();expect(screen.queryByText('Archive this item')).not.toBeInTheDocument();
});
test('a late inventory response after a home change does not show previous home items',async()=>{
 let finish;api.getHomeItems.mockImplementationOnce(()=>new Promise(resolve=>{finish=resolve;})).mockResolvedValueOnce([]);
 const view=show();view.rerender(<MemoryRouter><ItemWorkspace homeId={43} homeLabel="Other home" canManage askGeneral={jest.fn()} /></MemoryRouter>);
 await screen.findByText('Your first item is a useful place to start.');finish([item]);await waitFor(()=>expect(screen.queryByText('Kitchen washer')).not.toBeInTheDocument());
});

test('removing evidence clears an answer and its selected source',async()=>{
 api.askItemAI.mockResolvedValue({statements:[{answer:'Use A',quote:'programme A',sourceId:9}]});api.detachItemEvidence.mockResolvedValue({...item,evidence:[]});show('/my-home/items?item=7&home=42');
 await screen.findByRole('heading',{name:'Kitchen washer'});fireEvent.click(screen.getByLabelText('Washer manual'));fireEvent.change(screen.getByLabelText('Your question'),{target:{value:'Which programme?'}});fireEvent.click(screen.getByRole('button',{name:'Send question'}));await screen.findByText('programme A');
 fireEvent.click(screen.getByRole('button',{name:'Remove association'}));await waitFor(()=>expect(screen.queryByText('programme A')).not.toBeInTheDocument());expect(screen.getByRole('button',{name:'Send question'})).toBeDisabled();
});
