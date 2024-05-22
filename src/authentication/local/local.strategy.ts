import { Strategy } from 'passport-local'
import { PassportStrategy } from '@nestjs/passport'
import { Injectable, UnauthorizedException } from '@nestjs/common'
import { AuthenticationService } from '../authentication.service'   
import { User } from 'src/user/entities/user.entity'

@Injectable()
export class LocalStrategy extends PassportStrategy(Strategy){
    constructor(private authenticationService: AuthenticationService){
        super({
            usernameField: 'email',
            passwordField: 'password'
        })
    }

    validate(email: string, password: string){
        const user = this.authenticationService.validateUser(email, password)
        if(!user){
            throw new UnauthorizedException()
        }
        return user
    }
}