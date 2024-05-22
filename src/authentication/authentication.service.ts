import { Injectable, UnauthorizedException } from '@nestjs/common';
import { FindUserDto } from 'src/user/dto/find-user.dto';
import { UserService } from 'src/user/user.service';

@Injectable()
export class AuthenticationService {
    constructor(private userService: UserService){}

    async validateUser(email: string, password: string){
        const query = new FindUserDto()
        query.email = email

        const user = await this.userService.findAll(query)
        
        if(!user){
            throw new UnauthorizedException()
        }
        //TODO: implement user validation comparing user password and candidate password
    }
}
