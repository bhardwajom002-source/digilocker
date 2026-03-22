import { useNavigate } from 'react-router-dom';

export default function SetupPassword() {
  const navigate = useNavigate();
  
  // Redirect to onboarding if accessed directly
  navigate('/onboarding');
  
  return null;
}
