import { AppConfig, Config } from './app.config';

export class AppServerConfig extends AppConfig {
  constructor(config: Config) {
    super(null);
    this.config = config;
  }

  public load(): Promise<void> {
    console.log('Config already loaded', this.config);
    return Promise.resolve();
  }
}
