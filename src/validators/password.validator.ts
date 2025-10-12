import {
  ValidatorConstraint,
  ValidatorConstraintInterface,
} from 'class-validator';

@ValidatorConstraint({ name: 'IsValidPassword', async: false })
export class IsValidPassword implements ValidatorConstraintInterface {
  private message: string;

  validate(value: string | undefined) {
    if (!value) {
      return true;
    }

    if (value.trim().length === 0) {
      this.message = 'Password must not be empty';
      return false;
    }

    const passwordPattern =
      /^(?=.*[a-z])(?=.*\d)(?=.*[!@#$%^&*()_+\-={}:;"'<>,.?/|~\\])[A-Za-z\d!@#$%^&*()_+\-={}:;"'<>,.?/|~\\]{8,}$/;

    if (!passwordPattern.test(value)) {
      this.message =
        'The password must contain a minimum of 8 characters, including at least one lowercase letter, one number, and one special character';
      return false;
    }
    return true;
  }

  defaultMessage() {
    return this.message || 'Invalid password';
  }
}
