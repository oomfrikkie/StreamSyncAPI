import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';
import { AuthService } from './auth.service';
import { JwtStrategy } from './jwt.strategy';
import { AccountService } from '../account/account.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Account } from '../account/account.entity';


@Module({
	imports: [
		PassportModule,
		JwtModule.register({
			secret: process.env.JWT_SECRET || 'supersecretkey',
			signOptions: { expiresIn: '1h' },
		}),
		TypeOrmModule.forFeature([Account]),
	],
	providers: [AuthService, JwtStrategy],
	
	exports: [AuthService],
})
export class AuthModule {}
