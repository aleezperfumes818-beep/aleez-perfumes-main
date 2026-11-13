--!strict
-- Creator Store Auto-Loader: Attempts to auto-insert HD Admin and Time-Played Leaderboard

local InsertService = game:GetService("InsertService")
local Workspace = game:GetService("Workspace")

local CreatorStoreLoader = {}

local HD_ADMIN_ASSET_ID = 857927023
local THUMBNAIL_LEADERBOARD_ID = 5352156968

function CreatorStoreLoader.init()
    -- 1. Attempt to auto-load HD Admin
    task.spawn(function()
        local success, model = pcall(function()
            return InsertService:LoadAsset(HD_ADMIN_ASSET_ID)
        end)

        if success and model then
            model.Name = "HD_Admin_Model"
            model.Parent = Workspace
            print("🛡️ [CreatorStore] HD Admin successfully loaded via InsertService!")
        else
            print("ℹ️ [CreatorStore] HD Admin can also be added in 1-click via Toolbox (Search: 'HD Admin').")
        end
    end)

    -- 2. Attempt to auto-load Time-Played Leaderboard
    task.spawn(function()
        local success, model = pcall(function()
            return InsertService:LoadAsset(THUMBNAIL_LEADERBOARD_ID)
        end)

        if success and model then
            model.Name = "Imported_TimePlayed_Leaderboard"
            -- Position near club entrance
            local primary = model.PrimaryPart or model:FindFirstChildWhichIsA("BasePart")
            if primary then
                primary.CFrame = CFrame.new(25, 6, 45) * CFrame.Angles(0, math.rad(-30), 0)
            end
            model.Parent = Workspace
            print("🏆 [CreatorStore] Time-Played Leaderboard (5352156968) successfully loaded!")
        else
            print("ℹ️ [CreatorStore] Native Thumbnail Leaderboard with live avatar headshots is actively running.")
        end
    end)
end

return CreatorStoreLoader
