--!strict
-- Global Club Music Server: Replicates songs across the entire club

local Players = game:GetService("Players")
local ReplicatedStorage = game:GetService("ReplicatedStorage")
local Config = require(ReplicatedStorage.Shared.Config)
local Network = require(ReplicatedStorage.Shared.Network)

local MusicServer = {}

local currentTrackIndex = 1
local currentAssetId = Config.Playlist[1].AssetId
local currentTitle = Config.Playlist[1].Title
local isPlaying = true

function MusicServer.init()
    local changeRemote = Network.getEvent("ChangeClubMusic")
    local syncRemote = Network.getEvent("ClubMusicSync")

    -- Sync to newly joining players
    Players.PlayerAdded:Connect(function(player)
        task.delay(1.5, function()
            syncRemote:FireClient(player, {
                AssetId = currentAssetId,
                Title = currentTitle,
                IsPlaying = isPlaying
            })
        end)
    end)

    -- Handle request to change song
    changeRemote.OnServerEvent:Connect(function(player: Player, action: string, data: any)
        if action == "skip" then
            local delta = tonumber(data) or 1
            currentTrackIndex = currentTrackIndex + delta
            if currentTrackIndex > #Config.Playlist then
                currentTrackIndex = 1
            elseif currentTrackIndex < 1 then
                currentTrackIndex = #Config.Playlist
            end

            local track = Config.Playlist[currentTrackIndex]
            currentAssetId = track.AssetId
            currentTitle = track.Title
            isPlaying = true

            syncRemote:FireAllClients({
                AssetId = currentAssetId,
                Title = currentTitle,
                IsPlaying = isPlaying
            })

            local notif = Network.getEvent("Notification")
            notif:FireAllClients("🎵 " .. player.DisplayName .. " changed song: " .. currentTitle)

        elseif action == "custom" then
            local id = tonumber(data)
            if id then
                currentAssetId = "rbxassetid://" .. tostring(id)
                currentTitle = "Tamil Custom: " .. tostring(id)
                isPlaying = true

                syncRemote:FireAllClients({
                    AssetId = currentAssetId,
                    Title = currentTitle,
                    IsPlaying = isPlaying
                })

                local notif = Network.getEvent("Notification")
                notif:FireAllClients("🎵 " .. player.DisplayName .. " playing custom Tamil track: " .. tostring(id))
            end

        elseif action == "pause" then
            isPlaying = not isPlaying
            syncRemote:FireAllClients({
                AssetId = currentAssetId,
                Title = currentTitle,
                IsPlaying = isPlaying
            })
        end
    end)
end

function MusicServer.getCurrentInfo()
    return {
        AssetId = currentAssetId,
        Title = currentTitle,
        IsPlaying = isPlaying
    }
end

return MusicServer
