import { Pipe, PipeTransform } from '@angular/core';

@Pipe({name: 'formatNumber'})
export class FormatNumberPipe implements PipeTransform {
  transform(value: number): string {
    return value.toLocaleString();
  }
}