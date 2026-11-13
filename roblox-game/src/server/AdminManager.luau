--!strict
-- Admin Manager: Chat Commands, Admin Panel Remote Handlers & Backpack Admin Tools

local Players = game:GetService("Players")
local Lighting = game:GetService("Lighting")
local ReplicatedStorage = game:GetService("ReplicatedStorage")
local RunService = game:GetService("RunService")

local Config = require(ReplicatedStorage.Shared.Config)
local Network = require(ReplicatedStorage.Shared.Network)
local LeaderstatsManager = require(script.Parent.LeaderstatsManager)
local ClubFX = require(script.Parent.ClubFX)

local AdminManager = {}

function AdminManager.isAdmin(player: Player): boolean
    if player.UserId == game.CreatorId then return true end
    if RunService:IsStudio() then return true end -- Auto Admin in Studio testing!
    return table.find(Config.Admins, player.UserId) ~= nil
end

function AdminManager.giveAdminTools(player: Player)
    local backpack = player:FindFirstChild("Backpack")
    if not backpack then return end

    -- 1. Speed Coil Tool
    if not backpack:FindFirstChild("⚡ Speed Coil") then
        local speedTool = Instance.new("Tool")
        speedTool.Name = "⚡ Speed Coil"
        speedTool.ToolTip = "Hold to run at super speed!"

        local handle = Instance.new("Part")
        handle.Name = "Handle"
        handle.Size = Vector3.new(1, 1.8, 1)
        handle.Material = Enum.Material.Neon
        handle.Color = Color3.fromRGB(0, 240, 255)
        handle.Parent = speedTool

        speedTool.Equipped:Connect(function()
            local hum = player.Character and player.Character:FindFirstChildOfClass("Humanoid")
            if hum then hum.WalkSpeed = 42 end
        end)
        speedTool.Unequipped:Connect(function()
            local hum = player.Character and player.Character:FindFirstChildOfClass("Humanoid")
            if hum then hum.WalkSpeed = 16 end
        end)
        speedTool.Parent = backpack
    end

    -- 2. Gravity Coil Tool
    if not backpack:FindFirstChild("🦘 Gravity Coil") then
        local gravTool = Instance.new("Tool")
        gravTool.Name = "🦘 Gravity Coil"
        gravTool.ToolTip = "Hold to jump ultra high!"

        local handle = Instance.new("Part")
        handle.Name = "Handle"
        handle.Size = Vector3.new(1, 1.8, 1)
        handle.Material = Enum.Material.Neon
        handle.Color = Color3.fromRGB(180, 50, 255)
        handle.Parent = gravTool

        gravTool.Equipped:Connect(function()
            local hum = player.Character and player.Character:FindFirstChildOfClass("Humanoid")
            if hum then
                hum.UseJumpPower = true
                hum.JumpPower = 130
            end
        end)
        gravTool.Unequipped:Connect(function()
            local hum = player.Character and player.Character:FindFirstChildOfClass("Humanoid")
            if hum then
                hum.JumpPower = 50
            end
        end)
        gravTool.Parent = backpack
    end

    -- 3. Smoke Cannon Remote Tool
    if not backpack:FindFirstChild("💨 Smoke Blast") then
        local smokeTool = Instance.new("Tool")
        smokeTool.Name = "💨 Smoke Blast"
        smokeTool.ToolTip = "Click to fire the stage smoke jets!"

        local handle = Instance.new("Part")
        handle.Name = "Handle"
        handle.Size = Vector3.new(1, 1, 1)
        handle.Material = Enum.Material.Neon
        handle.Color = Color3.fromRGB(255, 60, 140)
        handle.Parent = smokeTool

        smokeTool.Activated:Connect(function()
            ClubFX.blastSmoke()
            local notif = Network.getEvent("Notification")
            notif:FireAllClients("💨 Admin " .. player.DisplayName .. " FIRED THE SMOKE JETS! ⚡")
        end)
        smokeTool.Parent = backpack
    end
end

function AdminManager.init()
    local adminEvent = Network.getEvent("AdminCommand")
    local stateSync = Network.getEvent("AdminStateSync")

    local function setupPlayer(player: Player)
        if AdminManager.isAdmin(player) then
            task.delay(0.5, function()
                stateSync:FireClient(player, true)
            end)

            player.CharacterAdded:Connect(function()
                task.wait(0.5)
                AdminManager.giveAdminTools(player)
            end)

            if player.Character then
                AdminManager.giveAdminTools(player)
            end

            player.Chatted:Connect(function(message)
                AdminManager.processChatCommand(player, message)
            end)
        end
    end

    Players.PlayerAdded:Connect(setupPlayer)
    for _, p in ipairs(Players:GetPlayers()) do
        task.spawn(setupPlayer, p)
    end

    -- Allow client to check admin on startup
    adminEvent.OnServerEvent:Connect(function(player: Player, command: string, arg1: any, arg2: any)
        if command == "query" then
            if AdminManager.isAdmin(player) then
                stateSync:FireClient(player, true)
                AdminManager.giveAdminTools(player)
            end
            return
        end

        if not AdminManager.isAdmin(player) then return end
        AdminManager.executeCommand(player, command, arg1, arg2)
    end)
end

function AdminManager.processChatCommand(player: Player, message: string)
    if string.sub(message, 1, 1) ~= ":" then return end
    local args = string.split(string.sub(message, 2), " ")
    local cmd = string.lower(args[1])
    table.remove(args, 1)
    AdminManager.executeCommand(player, cmd, args[1], args[2])
end

function AdminManager.executeCommand(player: Player, cmd: string, arg1: any, arg2: any)
    local notif = Network.getEvent("Notification")
    local char = player.Character
    local hum = char and char:FindFirstChildOfClass("Humanoid")

    if cmd == "speed" then
        local spd = tonumber(arg1) or 36
        if hum then hum.WalkSpeed = spd end
        notif:FireClient(player, "⚡ WalkSpeed set to " .. spd)

    elseif cmd == "jump" then
        local jmp = tonumber(arg1) or 120
        if hum then
            hum.UseJumpPower = true
            hum.JumpPower = jmp
        end
        notif:FireClient(player, "🦘 JumpPower set to " .. jmp)

    elseif cmd == "vibes" or cmd == "givevibes" then
        local amount = tonumber(arg1) or 1000
        LeaderstatsManager.addVibes(player, amount)
        notif:FireClient(player, "💎 +" .. amount .. " Vibes added!")

    elseif cmd == "announce" then
        local msg = tostring(arg1 or "")
        if #msg > 0 then
            notif:FireAllClients("📢 [Announcement]: " .. msg)
        end

    elseif cmd == "smokeblast" or cmd == "smoke" then
        ClubFX.blastSmoke()
        notif:FireAllClients("💨 Stage Smoke Blast Triggered! ⚡")

    elseif cmd == "time" then
        local timeName = string.lower(tostring(arg1 or ""))
        if timeName == "day" then
            Lighting.ClockTime = 14
            Lighting.Brightness = 3
        elseif timeName == "sunset" then
            Lighting.ClockTime = 17.5
            Lighting.Brightness = 2.5
        else
            Lighting.ClockTime = 14
        end
        notif:FireClient(player, "🕒 Time changed to " .. tostring(Lighting.ClockTime))
    end
end

return AdminManager
