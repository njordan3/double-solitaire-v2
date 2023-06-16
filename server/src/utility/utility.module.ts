import { Global, Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { UtilityService } from './utility.service';

@Global()
@Module({
    imports: [ConfigModule.forRoot()],
    providers: [UtilityService],
    exports: [UtilityService],
})
export class UtilityModule {}
