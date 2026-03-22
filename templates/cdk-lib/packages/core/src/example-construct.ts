import { Construct } from 'constructs';

export interface ExampleConstructProps {
  readonly name: string;
}

export class ExampleConstruct extends Construct {
  public readonly name: string;

  constructor(scope: Construct, id: string, props: ExampleConstructProps) {
    super(scope, id);
    this.name = props.name;
  }
}
