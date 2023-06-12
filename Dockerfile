# syntax=docker/dockerfile:1

FROM mcr.microsoft.com/dotnet/sdk:7.0 as build-env
WORKDIR /Scoreboard.API
COPY Scoreboard.API/Scoreboard.API.csproj .
RUN dotnet restore
COPY . .
RUN dotnet publish Scoreboard.API/Scoreboard.API.csproj -c Release -o /Publish

FROM mcr.microsoft.com/dotnet/aspnet:7.0 as runtime
WORKDIR /Publish
COPY --from=build-env /Publish .
EXPOSE 7028
ENV ASPNETCORE_URLS=https://+:7028
ENTRYPOINT ["dotnet", "Scoreboard.API.dll"]