import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import GoalEntry from '../features/journey/GoalEntry';
export default function StartPage({ embedded = false }) {
  return <>{!embedded && <Navbar />}<GoalEntry />{!embedded && <Footer />}</>;
}
