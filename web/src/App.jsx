import { SignedIn, SignedOut, SignInButton, UserButton } from '@clerk/clerk-react';
import './App.css'

function App() {

  return (
    <>
      <h1>Hello World</h1>
      <SignedOut>
        <SignInButton mode='modal'/>
      </SignedOut>
      <SignedIn>
        <UserButton />
      </SignedIn>
    </>
  )
}

export default App
