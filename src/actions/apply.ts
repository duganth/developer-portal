import * as Sentry from '@sentry/browser';
import { Action, ActionCreator } from 'redux';
import { ThunkAction } from 'redux-thunk';
import { history } from '../store';
import { IApiList, IErrorableInput, IRootState } from '../types';
import * as constants from '../types/constants';
import { validateEmail, validateOAuthRedirectURI } from '../utils/validators';

export interface IUpdateApplicationFirstName extends Action {
  newValue: IErrorableInput;
  type: constants.UPDATE_APPLICATION_FIRST_NAME;
}

export interface IUpdateApplicationLastName extends Action {
  newValue: IErrorableInput;
  type: constants.UPDATE_APPLICATION_LAST_NAME;
}

export interface IUpdateApplicationEmail extends Action {
  newValue: IErrorableInput;
  type: constants.UPDATE_APPLICATION_EMAIL;
}

export interface IUpdateApplicationOrganization extends Action {
  newValue: IErrorableInput;
  type: constants.UPDATE_APPLICATION_ORGANIZATION;
}

export interface IUpdateApplicationDescription extends Action {
  newValue: IErrorableInput;
  type: constants.UPDATE_APPLICATION_DESCRIPTION;
}

export interface IUpdateApplicationOAuthApplicationType extends Action {
  newValue: IErrorableInput;
  type: constants.UPDATE_APPLICATION_OAUTH_APPLICATION_TYPE;
}

export interface IUpdateApplicationOAuthRedirectURI extends Action {
  newValue: IErrorableInput;
  type: constants.UPDATE_APPLICATION_OAUTH_REDIRECT_URL;
}

export interface IToggleAcceptTos extends Action {
  type: constants.TOGGLE_ACCEPT_TOS;
}

export interface IToggleSelectedApi extends Action {
  type: constants.TOGGLE_SELECTED_API;
  apiId: string;
}

export type UpdateApplicationAction =
  | IUpdateApplicationDescription
  | IUpdateApplicationEmail
  | IUpdateApplicationFirstName
  | IUpdateApplicationLastName
  | IUpdateApplicationOrganization
  | IUpdateApplicationOAuthApplicationType
  | IUpdateApplicationOAuthRedirectURI
  | IToggleAcceptTos
  | IToggleSelectedApi;

export interface ISubmitForm extends Action {
  type: constants.SUBMIT_APPLICATION_BEGIN;
}

export interface ISubmitFormSuccess extends Action {
  clientID: string;
  clientSecret: string;
  type: constants.SUBMIT_APPLICATION_SUCCESS;
  token: string;
}

export interface ISubmitFormError extends Action {
  type: constants.SUBMIT_APPLICATION_ERROR;
  status: string;
}

export type SubmitFormAction = ISubmitForm | ISubmitFormSuccess | ISubmitFormError;

export type SubmitFormThunk = ThunkAction<
  Promise<SubmitFormAction>,
  IRootState,
  undefined,
  SubmitFormAction
>;

const apisToList = (apis: IApiList) => {
  return Object.keys(apis)
    .filter(key => apis[key])
    .join(',');
};

function buildApplicationBody({ application }: IRootState) {
  const applicationBody: any = {};
  applicationBody.apis = apisToList(application.inputs.apis);
  ['description', 'email', 'firstName', 'lastName', 'oAuthApplicationType', 'oAuthRedirectURI', 'organization'].forEach(
    property => {
      if (application.inputs[property]) {
        applicationBody[property] = application.inputs[property].value;
      }
    },
  );
  applicationBody.termsOfService = application.inputs.termsOfService;
  return applicationBody;
}

export const submitForm: ActionCreator<SubmitFormThunk> = () => {
  return (dispatch, state) => {
    dispatch(submitFormBegin());

    const applicationBody = buildApplicationBody(state());

    const request = new Request(
      `${
        process.env.REACT_APP_DEVELOPER_PORTAL_SELF_SERVICE_URL
      }/internal/developer-portal-backend/developer_application`,
      {
        body: JSON.stringify(applicationBody),
        headers: {
          accept: 'application/json',
          'content-type': 'application/json',
        },
        method: 'POST',
      },
    );
    return fetch(request)
      .then(response => {
        if (!response.ok) {
          throw Error(response.statusText);
        }
        return response;
      })
      .then(response => response.json())
      .then(json => {
        if (json.token || json.clientID) {
          const result = dispatch(submitFormSuccess(json.token, json.clientID, json.clientSecret));
          history.push('/applied');
          return result;
        } else {
          return dispatch(submitFormError(json.errorMessage));
        }
      })
      .catch(error => {
        Sentry.withScope(scope => {
          scope.setLevel(Sentry.Severity.fromString('warning'));
          Sentry.captureException(error);
        });
        return dispatch(submitFormError(error.message));
      });
  };
};

export const submitFormBegin: ActionCreator<ISubmitForm> = () => {
  return {
    type: constants.SUBMIT_APPLICATION_BEGIN,
  };
};

export const submitFormSuccess: ActionCreator<ISubmitFormSuccess> = (
  token: string,
  clientID: string,
  clientSecret: string,
) => {
  return {
    clientID,
    clientSecret,
    token,
    type: constants.SUBMIT_APPLICATION_SUCCESS,
  };
};

export const submitFormError: ActionCreator<ISubmitFormError> = (status: string) => {
  return {
    status,
    type: constants.SUBMIT_APPLICATION_ERROR,
  };
};

export const updateApplicationEmail: ActionCreator<IUpdateApplicationEmail> = (
  newValue: IErrorableInput,
) => {
  return {
    newValue: validateEmail(newValue),
    type: constants.UPDATE_APPLICATION_EMAIL,
  };
};

export const updateApplicationDescription: ActionCreator<IUpdateApplicationDescription> = (
  newValue: IErrorableInput,
) => {
  return {
    newValue,
    type: constants.UPDATE_APPLICATION_DESCRIPTION,
  };
};

export const updateApplicationFirstName: ActionCreator<IUpdateApplicationFirstName> = (
  newValue: IErrorableInput,
) => {
  return {
    newValue,
    type: constants.UPDATE_APPLICATION_FIRST_NAME,
  };
};

export const updateApplicationLastName: ActionCreator<IUpdateApplicationLastName> = (
  newValue: IErrorableInput,
) => {
  return {
    newValue,
    type: constants.UPDATE_APPLICATION_LAST_NAME,
  };
};

export const updateApplicationOAuthApplicationType: ActionCreator<
  IUpdateApplicationOAuthApplicationType
> = (newValue: IErrorableInput) => {
  return {
    newValue,
    type: constants.UPDATE_APPLICATION_OAUTH_APPLICATION_TYPE,
  };
};

export const updateApplicationOAuthRedirectURI: ActionCreator<
  IUpdateApplicationOAuthRedirectURI
> = (newValue: IErrorableInput) => {
  return {
    newValue: validateOAuthRedirectURI(newValue),
    type: constants.UPDATE_APPLICATION_OAUTH_REDIRECT_URL,
  };
};

export const updateApplicationOrganization: ActionCreator<IUpdateApplicationOrganization> = (
  newValue: IErrorableInput,
) => {
  return {
    newValue,
    type: constants.UPDATE_APPLICATION_ORGANIZATION,
  };
};

export const toggleSelectedApi: ActionCreator<IToggleSelectedApi> = (
  apiId: string,
) => {
  return {
    apiId,
    type: constants.TOGGLE_SELECTED_API,
  };
};

export const toggleAcceptTos: ActionCreator<IToggleAcceptTos> = () => {
  return {
    type: constants.TOGGLE_ACCEPT_TOS,
  };
};