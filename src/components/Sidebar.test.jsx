import { render,screen,fireEvent } from '@testing-library/react';
import Sidebar from './Sidebar';
const mockNavigate=jest.fn();
jest.mock('react-router-dom',()=>({useNavigate:()=>mockNavigate,useLocation:()=>({pathname:'/control-centre'})}),{virtual:true});
jest.mock('../context/AuthContext',()=>({useAuth:()=>({user:{email:'maya.demo@example.invalid'}})}));
jest.mock('../api/api',()=>({getPartnerProgrammeAccessStatus:async()=>false}));
beforeEach(() => { window.innerWidth = 1440; window.matchMedia = jest.fn(() => ({ matches: false, addEventListener: jest.fn(), removeEventListener: jest.fn() })); });
test('Maya has access to Control centre through homeowner navigation', async () => {
 process.env.REACT_APP_CONTROL_CENTRE_ENABLED='true';
 render(<Sidebar/>);
 const centre=screen.getByRole('button',{name:'Control centre'});
 expect(centre).toHaveAttribute('aria-current','page');
 expect(centre.tabIndex).toBe(0);
 expect(screen.queryByRole('button',{name:'Operations'})).not.toBeInTheDocument();
 fireEvent.click(centre);
 expect(mockNavigate).toHaveBeenCalledWith('/control-centre');
 delete process.env.REACT_APP_CONTROL_CENTRE_ENABLED;
});

test('narrow screens retain every navigation action in a compact rail', () => {
 window.innerWidth=390;
 const {container}=render(<Sidebar/>);
 expect(container.querySelector('.ht-sidebar-shell')).toHaveAttribute('data-collapsed','true');
 expect(screen.getByRole('button',{name:'Vault'})).toBeVisible();
 fireEvent.click(screen.getByRole('button',{name:'Expand navigation'}));
 const drawer=screen.getByRole('dialog',{name:'HomeTruth navigation'});
 expect(drawer).toHaveAttribute('aria-modal','true');
 fireEvent.keyDown(drawer,{key:'Escape'});
 expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
 expect(screen.getByRole('button',{name:'Expand navigation'})).toHaveFocus();
 fireEvent.click(screen.getByRole('button',{name:'Vault'}));
 expect(mockNavigate).toHaveBeenCalledWith('/documents');
});
test('collapsed navigation retains settings destinations and accessible names', () => {
 render(<Sidebar/>);
 fireEvent.click(screen.getByRole('button',{name:'Collapse navigation'}));
 fireEvent.click(screen.getByRole('button',{name:'Settings'}));
 expect(screen.getByRole('button',{name:'Settings'})).toHaveAttribute('aria-expanded','true');
 fireEvent.click(screen.getByRole('button',{name:'Data Privacy'}));
 expect(mockNavigate).toHaveBeenCalledWith('/settings/data-privacy');
});

test('mobile drawer traps focus including the brand link and restores it after backdrop close', () => {
 window.innerWidth=390;
 render(<Sidebar/>);
 fireEvent.click(screen.getByRole('button',{name:'Expand navigation'}));
 const brand=screen.getByRole('link',{name:'HomeTruth dashboard'});
 brand.focus();
 fireEvent.keyDown(brand,{key:'Tab',shiftKey:true});
 expect(screen.getByRole('button',{name:'Settings'})).toHaveFocus();
 fireEvent.click(screen.getByRole('button',{name:'Close navigation'}));
 expect(screen.getByRole('button',{name:'Expand navigation'})).toHaveFocus();
});
