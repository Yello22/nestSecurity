import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
  UseInterceptors,
} from '@nestjs/common';
import { plainToInstance } from 'class-transformer';
import { Observable, map } from 'rxjs';

type ClassContructor = new (...args: any[]) => {};

export function Serialize(dto: ClassContructor) {
  return UseInterceptors(new SerializeInterceptor(dto));
}

@Injectable()
export class SerializeInterceptor implements NestInterceptor {
  constructor(private Dto: any) {}

  intercept(
    context: ExecutionContext,
    next: CallHandler<any>,
  ): Observable<any> | Promise<Observable<any>> {
    return next.handle().pipe(
      map((data: any) => {
        return plainToInstance(this.Dto, data, {
          excludeExtraneousValues: true,
        });
      }),
    );
  }
}
