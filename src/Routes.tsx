import React from 'react'
import { BrowserRouter, Switch, Route, Redirect } from 'react-router-dom'

import BasePage from './Components/BasePage'
import Dashboard from './Pages/Dashboard'
import List from './Pages/List'
import SignIn from './Pages/SignIn'

import PrivateRoute from './Components/PrivateRoute'




const Routes: React.FC = () => {

    return (
        <BrowserRouter>
            <Switch>
                <Route exact path="/sign-in" component={SignIn} />
                <BasePage>
                    <PrivateRoute exact path="/" componentRouter={Dashboard} />
                    <PrivateRoute exact path="/list/:type" componentRouter={List} />
                </BasePage>
                <Redirect to="/" />
            </Switch>
        </BrowserRouter>
    )
}

export default Routes