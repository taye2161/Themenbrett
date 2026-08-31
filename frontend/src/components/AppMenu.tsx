import Container from "react-bootstrap/Container";
import Nav from "react-bootstrap/Nav";
import Navbar from "react-bootstrap/Navbar";
import { LinkContainer } from "./LinkContainer";
import { useState } from "react";
import { LoginDialog } from "./LoginDialog";
import { useLoginContext } from "../auth/LoginContext";
import { logout } from "../backend/api";
import { useNavigate } from "react-router";



export function AppMenu() {
    const [showLogin, setShowLogin] = useState(false);

    const { loginInfo, setLoginInfo } = useLoginContext();

    const navigate = useNavigate();

    async function handleLogout() {
        try {
            await logout();
            setLoginInfo(false);
            navigate('/', { replace: true });
        } catch (error) {
            console.error(error);
        }
    }
    
    return (
        <Navbar expand="lg">
            <Container>
                <Navbar.Brand>Themenbrett</Navbar.Brand>

                <Navbar.Toggle aria-controls="basic-navbar-nav" />

                <Navbar.Collapse id="basic-navbar-nav">
                    <Nav className="ms-auto">
                        <LinkContainer to="/">
                            <Nav.Link>Übersicht</Nav.Link>
                        </LinkContainer>

                        {
                            (loginInfo) ?
                                <LinkContainer to="/prefs">
                                    <Nav.Link>Prefs</Nav.Link>
                                </LinkContainer> :
                            null
                        }

                        {
                            (loginInfo && loginInfo.role === 'a') ?
                                <LinkContainer to="/admin">
                                    <Nav.Link>Admin</Nav.Link>
                                </LinkContainer> :
                            null
                        }

                        {(loginInfo === false) ?
                            <Nav.Link onClick={() => setShowLogin(true)}>Login</Nav.Link> :
                            (loginInfo) ?
                                <Nav.Link onClick={handleLogout}>Logout</Nav.Link> :
                                null
                        }
                        
                        
                    </Nav>
                </Navbar.Collapse>
            </Container>
            <LoginDialog show={showLogin} onClose={() => setShowLogin(false)}/>
        </Navbar>
    )
}