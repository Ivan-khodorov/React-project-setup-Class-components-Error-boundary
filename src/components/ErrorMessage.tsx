import { Component } from 'react';

interface ErrorMessageProps {
  message: string;
}

export class ErrorMessage extends Component<ErrorMessageProps> {
  render() {
    return <div role="alert">{this.props.message}</div>;
  }
}
