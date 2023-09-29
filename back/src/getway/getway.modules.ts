import { Module } from '@nestjs/common';
import { MyGateway } from './getway';
import { JwtModule } from '@nestjs/jwt';

@Module({
	imports: [JwtModule.register({})],
  providers: [MyGateway],
})
export class GetwayModule {}
