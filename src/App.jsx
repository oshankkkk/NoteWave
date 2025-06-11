import React from 'react';
import { GoogleOAuthProvider } from '@react-oauth/google';
import Calendar from './Calendar'; // Adjust the path if needed

function App() {
    return (
        <GoogleOAuthProvider clientId="19900462508-vbkiucsn95h5kususcc8qc05uf5s00o3.apps.googleusercontent.com">
            <div>
                <Calendar />
            </div>
        </GoogleOAuthProvider>
    );
}

export default App;