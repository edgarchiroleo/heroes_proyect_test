export interface IHeroeModel{
  id: string;
  code: string;
  name: string;
  description: string;
  company: string;
}

export interface IHeroePagination
{
    length: number;
    size: number;
    page: number;
    lastPage: number;
    startIndex: number;
    endIndex: number;
}
