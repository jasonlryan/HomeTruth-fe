import {fireEvent,render,screen,waitFor} from '@testing-library/react';
import ApplianceAgent from './ApplianceAgent';
import * as api from '../../api/api';
jest.mock('../../api/api',()=>({findItemManual:jest.fn(),getApplianceAgentResult:jest.fn(),saveAgentManual:jest.fn()}));
const result={id:3,status:'needs_review',identity:{brand:'Bosch',model:'W100'},notice:'Check the complete model.',candidates:[{title:'Bosch instruction manual',url:'https://www.bosch-home.co.uk/manual.pdf',kind:'pdf',quote:'For W100'}]};
beforeEach(()=>{jest.clearAllMocks();api.getApplianceAgentResult.mockResolvedValue(null);global.crypto={randomUUID:()=> 'e99d6b94-a656-4591-b78f-cdeab470c315'};});
test('finds manual and requires model confirmation before importing; refresh retains result',async()=>{
 api.findItemManual.mockResolvedValue(result);api.saveAgentManual.mockResolvedValue({...result,status:'saved',notice:'Saved with this item.'});const onSaved=jest.fn();render(<ApplianceAgent homeId={42} itemId={7} onSaved={onSaved}/>);
 await waitFor(()=>expect(screen.getByRole('button',{name:'Find my manual'})).toBeEnabled());fireEvent.click(screen.getByRole('button',{name:'Find my manual'}));await screen.findByText('Bosch instruction manual');expect(api.findItemManual).toHaveBeenCalledWith(42,7,'e99d6b94-a656-4591-b78f-cdeab470c315');
 expect(screen.getByRole('button',{name:'Save this manual'})).toBeDisabled();fireEvent.click(screen.getByRole('checkbox'));fireEvent.click(screen.getByRole('button',{name:'Save this manual'}));await screen.findByText('Saved with this item.');expect(api.saveAgentManual).toHaveBeenCalledWith(42,7,3,0);expect(onSaved).toHaveBeenCalledTimes(1);
});
test('a manufacturer page is a link rather than a claim of an attached PDF',async()=>{
 api.getApplianceAgentResult.mockResolvedValue({...result,candidates:[{...result.candidates[0],kind:'support_page'}]});render(<ApplianceAgent homeId={42} itemId={7} onSaved={()=>{}}/>);await screen.findByText('Bosch instruction manual');expect(screen.queryByRole('button',{name:'Save this manual'})).not.toBeInTheDocument();expect(screen.getByRole('link',{name:'Open manufacturer source ↗'})).toHaveAttribute('href',result.candidates[0].url);
});
test('late lookup results do not update a different item after unmount',async()=>{
 let resolve;api.findItemManual.mockReturnValue(new Promise(r=>{resolve=r;}));const onSaved=jest.fn();const {unmount}=render(<ApplianceAgent homeId={42} itemId={7} onSaved={onSaved}/>);await waitFor(()=>expect(screen.getByRole('button',{name:'Find my manual'})).toBeEnabled());fireEvent.click(screen.getByRole('button',{name:'Find my manual'}));unmount();resolve(result);await Promise.resolve();expect(onSaved).not.toHaveBeenCalled();
});
