import { render,screen,fireEvent } from '@testing-library/react';
import Sidebar from './Sidebar';
const mockNavigate=jest.fn();
jest.mock('react-router-dom',()=>({useNavigate:()=>mockNavigate,useLocation:()=>({pathname:'/operations'})}),{virtual:true});
jest.mock('../context/AuthContext',()=>({useAuth:()=>({user:{email:'maya.demo@example.invalid'}})}));
jest.mock('../api/api',()=>({getPartnerProgrammeAccessStatus:async()=>false}));
test('operator navigation is a keyboard-focusable native control with current-page semantics',async()=>{
 process.env.REACT_APP_HOMEOWNER_DEMO='true';
 render(<Sidebar/>);const operations=screen.getByRole('button',{name:'Operations'});
 expect(operations.tagName).toBe('BUTTON');expect(operations).toHaveAttribute('aria-current','page');expect(operations.tabIndex).toBe(0);
 fireEvent.click(operations);expect(mockNavigate).toHaveBeenCalledWith('/operations');
 delete process.env.REACT_APP_HOMEOWNER_DEMO;
});
