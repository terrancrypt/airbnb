import { Module } from '@nestjs/common';
import { AuthModule } from './auth/auth.module';
import { UsersModule } from './users/users.module';
import { ConfigModule } from '@nestjs/config';
import { RoomsModule } from './rooms/rooms.module';
import { PrismaModule } from './prisma/prisma.module';
import { FirebaseModule } from './firebase/firebase.module';
import { ReservationsModule } from './reservations/reservations.module';
import { PlacesModule } from './places/places.module';
import { ReviewsModule } from './reviews/reviews.module';
import { JwtAuthGuard, RolesGuard } from './auth/guards';
import { JwtModule, JwtService } from '@nestjs/jwt';
import { AuthService } from './auth/auth.service';
import { SessionService } from './auth/session/session.service';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    JwtModule.register({}),
    PrismaModule,
    FirebaseModule,
    AuthModule,
    UsersModule,
    RoomsModule,
    ReservationsModule,
    PlacesModule,
    ReviewsModule,
  ],
  providers:[AuthService, SessionService]
})
export class AppModule {}
