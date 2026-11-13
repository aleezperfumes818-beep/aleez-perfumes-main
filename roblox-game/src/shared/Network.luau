--!strict
-- Network Manager: Safe registry for all multiplayer clubbing & karaoke RemoteEvents

local ReplicatedStorage = game:GetService("ReplicatedStorage")
local RunService = game:GetService("RunService")

local Network = {}

local EVENTS_FOLDER_NAME = "HangoutEvents"

local EVENT_NAMES = {
    "ToggleAFK",
    "ToggleRagdoll",
    "PlayEmote",
    "StopEmote",
    "Notification",
    "TriggerSmoke",
    "ClaimDJ",
    "ChangeClubMusic",
    "ClubMusicSync",
    "AdminCommand",
    "AdminStateSync",
    -- Karaoke Systems
    "JoinKaraokeQueue",
    "LeaveKaraokeQueue",
    "KaraokeStateSync",
    "KaraokeLyricSync",
    "SkipKaraokeSinger"
}

local function getOrCreateFolder(): Folder
    local folder = ReplicatedStorage:FindFirstChild(EVENTS_FOLDER_NAME)
    if not folder then
        if RunService:IsServer() then
            folder = Instance.new("Folder")
            folder.Name = EVENTS_FOLDER_NAME
            folder.Parent = ReplicatedStorage
        else
            folder = ReplicatedStorage:WaitForChild(EVENTS_FOLDER_NAME, 15) :: Folder?
            if not folder then
                error("Critical: HangoutEvents folder did not replicate to client in time!")
            end
        end
    end
    return folder :: Folder
end

function Network.init()
    if RunService:IsServer() then
        local folder = getOrCreateFolder()
        for _, name in ipairs(EVENT_NAMES) do
            if not folder:FindFirstChild(name) then
                local remote = Instance.new("RemoteEvent")
                remote.Name = name
                remote.Parent = folder
            end
        end
    end
end

function Network.getEvent(name: string): RemoteEvent
    local folder = getOrCreateFolder()
    local remote = folder:FindFirstChild(name) :: RemoteEvent?
    if not remote then
        if RunService:IsServer() then
            remote = Instance.new("RemoteEvent")
            remote.Name = name
            remote.Parent = folder
        else
            remote = folder:WaitForChild(name, 10) :: RemoteEvent?
            if not remote then
                error("Critical: RemoteEvent " .. name .. " not found!")
            end
        end
    end
    return remote
end

return Network
