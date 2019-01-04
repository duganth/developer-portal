import * as React from 'react';

import { connect } from 'react-redux';
import { ThunkDispatch } from 'redux-thunk';

import ErrorableTextArea from '@department-of-veterans-affairs/formation/ErrorableTextArea';
import ErrorableTextInput from '@department-of-veterans-affairs/formation/ErrorableTextInput';
import ProgressButton from '@department-of-veterans-affairs/formation/ProgressButton';

import * as actions from '../actions'
import { IApplication, IErrorableInput, IRootState } from '../types';

import './Apply.scss';

interface IApplyProps extends IApplication {
  submitForm: () => void;
  toggleBenefits: () => void;
  toggleHealth: () => void;
  toggleFacilities: () => void;
  toggleVerification: () => void;
  updateDescription: (value: IErrorableInput) => void;
  updateEmail: (value: IErrorableInput) => void;
  updateFirstName: (value: IErrorableInput) => void;
  updateLastName: (value: IErrorableInput) => void;
  updateOrganization: (value: IErrorableInput) => void;
}

const mapStateToProps = (state : IRootState) => {
  return {
    ...state.application,
  };
};

type ApplicationDispatch = ThunkDispatch<IRootState, undefined, actions.SubmitFormAction | actions.UpdateApplicationAction>;

const mapDispatchToProps = (dispatch : ApplicationDispatch) => {
  return {
    submitForm: () => { dispatch(actions.submitForm()) },
    toggleBenefits: () => { dispatch(actions.toggleBenefitsApi()) },
    toggleFacilities: () => { dispatch(actions.toggleFacilitiesApi()) },
    toggleHealth: () => { dispatch(actions.toggleHealthApi()) },
    toggleVerification: () => { dispatch(actions.toggleVerificationApi()) },
    updateDescription: (value: IErrorableInput) => { dispatch(actions.updateApplicationDescription(value)) },
    updateEmail: (value: IErrorableInput) => { dispatch(actions.updateApplicationEmail(value)) },
    updateFirstName: (value: IErrorableInput) => { dispatch(actions.updateApplicationFirstName(value)) },
    updateLastName: (value: IErrorableInput) => { dispatch(actions.updateApplicationLastName(value)) },
    updateOrganization: (value: IErrorableInput) => { dispatch(actions.updateApplicationOrganization(value)) },
  };
};

function Apply ({ apis, description, email, firstName, lastName, organization, ...props} : IApplyProps) {
  const readyToSubmit = !!email.value && !!firstName.value && !!lastName.value && !!organization.value && ( apis.verification || apis.health || apis.benefits || apis.facilities );
  const requestedMoreThanHealth = apis.health && (apis.facilities || apis.verification || apis.benefits)

  const healthNotice = (
    <div>
    <p className="usa-font-lead">Thank you for your interest in VA Health API. You should received an email message shortly for further instructions.</p>
    <p>Need assistance? Email us at <a href="mailto:api@va.gov">api@va.gov</a></p>
    </div>
  );
  const tokenNotice = (
    <div>
    <p className="usa-font-lead"><strong>Your VA API token is:</strong> {props.token}</p>
    <p>Please note that this token cannot be used for VA Health API.</p>
    <p>Need assistance? Email us at <a href="mailto:api@va.gov">api@va.gov</a></p>
    </div>
  );
  const errorNotice = (
    <div>
    <p className="usa-font-lead">We encountered a server error while saving your form. Please try again later.</p>
    <p>Need assistance? Email us at <a href="mailto:api@va.gov">api@va.gov</a></p>
    </div>
  );
  return (
    <div role="region" aria-labelledby="apply-region" className="usa-grid api-application">
      <h1>Apply for VA API Key</h1>
      <p className="usa-font-lead">Please submit the form below and you'll receive an email with your API key(s) and further instructions. Thank you for being a part of our platform.</p>
      <div className="usa-grid-full">
        <div className="usa-width-two-thirds">
          <form className="usa-form">
            <fieldset>
              <legend>Application</legend>

              <ErrorableTextInput
                errorMessage={null}
                label="First name"
                field={firstName}
                onValueChange={props.updateFirstName}
                required={true} />

              <ErrorableTextInput
                errorMessage={null}
                label="Last name"
                field={lastName}
                onValueChange={props.updateLastName}
                required={true} />

              <ErrorableTextInput
                errorMessage={email.validation}
                label="Email"
                field={email}
                onValueChange={props.updateEmail}
                required={true} />

              <ErrorableTextInput
                errorMessage={null}
                label="Organization"
                field={organization}
                onValueChange={props.updateOrganization}
                required={true} />

              <label>Please select all of the APIs you'd like access to:</label>
              <div className="form-checkbox">
                <input
                  type="checkbox"
                  id="benefits"
                  name="benefits"
                  checked={apis.benefits}
                  onChange={props.toggleBenefits} />
                <label htmlFor="benefits">VA Benefits API</label>
              </div>

              <div className="form-checkbox">
                <input
                  type="checkbox"
                  id="health"
                  name="health"
                  checked={apis.health}
                  onChange={props.toggleHealth} />
                <label htmlFor="health">VA Health API</label>
              </div>

              <div className="form-checkbox">
                <input
                  type="checkbox"
                  id="facilities"
                  name="facilities"
                  checked={apis.facilities}
                  onChange={props.toggleFacilities} />
                <label htmlFor="facilities">VA Facilities API</label>
              </div>

              <div className="form-checkbox">
                <input
                  type="checkbox"
                  id="verification"
                  name="verification"
                  checked={apis.verification}
                  onChange={props.toggleVerification} />
                <label htmlFor="verification">VA Veteran Verification API</label>
              </div>

              <ErrorableTextArea
                errorMessage={null}
                label="Briefly describe how your organization will use VA API's."
                onValueChange={props.updateDescription}
                name="description"
                field={description}/>

              <ProgressButton
                buttonText={ props.sending ? "Sending..." : "Submit"}
                disabled={!readyToSubmit || props.sending}
                onButtonClick={props.submitForm}
                buttonClass="usa-button-primary" />
            </fieldset>
          </form>
        </div>
        <div className="usa-width-one-third">
          <div className="feature">
            <h3>Stay In Touch</h3>
            <p>Want to get news and updates about VA API Program? Sign up to receive email updates.</p>
            <a className="usa-button" href="https://vacommunity.secure.force.com/survey/ExAM__AMAndAnswerCreationPage?paId=a2ft0000000VVnJ">Sign Up</a>
          </div>
        </div>
      </div>
      { props.token && requestedMoreThanHealth ? tokenNotice : null }
      { props.token && !requestedMoreThanHealth && apis.health ? healthNotice : null }
      { props.errorStatus ? errorNotice : null }
    </div>
  );
}

export default connect(mapStateToProps, mapDispatchToProps)(Apply)